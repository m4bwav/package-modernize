#!/usr/bin/env bash
# Survey the GitHub side of a package repository (package-modernize, Phase 0). Read-only.
# Usage: survey-github.sh OWNER/REPO [> ai-docs/notes/survey-github.txt]
# Needs: gh (logged in), jq comes with gh. Every section prints its command first, so the output is its own evidence.
set -u
REPO="${1:?usage: survey-github.sh OWNER/REPO}"

section() { printf '\n## %s\n$ %s\n' "$1" "$2"; }
run() { section "$1" "$2"; eval "$2" 2>&1 || printf '(command failed: exit %s)\n' "$?"; }

printf '# GitHub survey: %s (%s)\n' "$REPO" "$(date -u +%Y-%m-%dT%H:%MZ)"

run "Repository" "gh repo view $REPO --json name,description,defaultBranchRef,pushedAt,createdAt,licenseInfo,stargazerCount,forkCount,isArchived,homepageUrl --jq '{name,description,defaultBranch:.defaultBranchRef.name,pushedAt,createdAt,license:.licenseInfo.key,stars:.stargazerCount,forks:.forkCount,archived:.isArchived,homepage:.homepageUrl}'"
run "Settings and security features" "gh api repos/$REPO --jq '{delete_branch_on_merge, has_wiki, has_projects, allow_squash_merge, web_commit_signoff_required, security_and_analysis}'"
run "Default workflow permissions" "gh api repos/$REPO/actions/permissions/workflow"
run "Branches" "gh api repos/$REPO/branches --paginate --jq '.[].name'"
run "Rulesets and branch protection" "gh api repos/$REPO/rulesets --jq '.[] | \"\\(.id) \\(.name) \\(.enforcement)\"'; gh api repos/$REPO/branches/\$(gh repo view $REPO --json defaultBranchRef --jq .defaultBranchRef.name)/protection --jq . 2>/dev/null || echo '(no classic branch protection)'"
run "Issues (all states)" "gh issue list -R $REPO --state all --limit 100 --json number,title,state,author,createdAt,closedAt --jq '.[] | \"#\\(.number) \\(.state) \\(.createdAt[:10]) \\(.author.login): \\(.title)\"'"
run "Pull requests (all states)" "gh pr list -R $REPO --state all --limit 100 --json number,title,state,author,headRefName,createdAt --jq '.[] | \"#\\(.number) \\(.state) \\(.createdAt[:10]) \\(.author.login) [\\(.headRefName)]: \\(.title)\"'"
run "Open Dependabot alerts by severity, package and scope" "gh api \"repos/$REPO/dependabot/alerts?state=open&per_page=100\" --paginate --jq '.[] | \"\\(.security_advisory.severity) \\(.dependency.package.name) \\(.dependency.scope)\"' | sort | uniq -c | sort -rn"
run "Open Dependabot alerts, count" "gh api \"repos/$REPO/dependabot/alerts?state=open&per_page=100\" --paginate --jq length"
run "Webhooks (dead services leave these)" "gh api repos/$REPO/hooks --jq '.[] | \"\\(.id) \\(.config.url) active=\\(.active) events=\\(.events|join(\",\"))\"'"
run "Actions secrets (count) and variables" "gh api repos/$REPO/actions/secrets --jq '{total_count, names:[.secrets[].name]}'; gh api repos/$REPO/actions/variables --jq '{total_count, names:[.variables[].name]}'"
run "Environments" "gh api repos/$REPO/environments --jq '.environments[]? | \"\\(.name) reviewers=\\([.protection_rules[]? | select(.type==\"required_reviewers\") | .reviewers[]?.reviewer.login] | join(\",\"))\"'"
run "Workflows" "gh api repos/$REPO/actions/workflows --jq '.workflows[] | \"\\(.name) \\(.path) \\(.state)\"'"
run "Forks" "gh api repos/$REPO/forks --jq '.[] | \"\\(.full_name) pushed=\\(.pushed_at[:10])\"'"
run "Releases and tags" "gh release list -R $REPO --limit 20; gh api repos/$REPO/tags --jq '.[].name' | head -30"
run "Dead-service files in the default branch" "gh api repos/$REPO/git/trees/HEAD?recursive=1 --jq '.tree[].path' | grep -Ei '^(\\.travis\\.yml|\\.snyk|\\.sonarcloud\\.properties|sonar-project\\.properties|\\.coveralls\\.yml|codecov\\.yml|\\.codecov\\.yml|appveyor\\.yml|\\.circleci/|\\.npmignore|\\.nuspec|\\.vscode/)' || echo '(none)'"
run "Badges in the README" "gh api repos/$REPO/readme --jq .content | base64 -d 2>/dev/null | grep -Eo 'https?://[^ )]*(shields\\.io|travis-ci|david-dm|snyk\\.io|coveralls|codecov|gitter|sonarcloud|nodei\\.co|badgen|badge)[^ )]*' | sort -u || echo '(none)'"

printf '\n## Things only the maintainer can see\n'
printf -- '- Installed GitHub Apps and authorized OAuth apps: github.com/settings/installations and github.com/settings/applications (the API refuses the gh token).\n'
printf -- '- Whether a token in history is still live: revoke it at the provider regardless.\n'
