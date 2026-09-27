#!/usr/bin/env bash
# Survey a NuGet package before planning (package-modernize, Phase 0). Read-only: nuget.org APIs and GitHub queries only.
# Usage: survey-nuget.sh PACKAGE_ID [OWNER/REPO]
# Needs: curl, node (for JSON), gh (logged in). The API URLs are NuGet's documented V3 protocol resources
# (learn.microsoft.com/nuget/api/overview), checked live on 2026-09-25 against JsonPrettyPrinter.
set -u
ID="${1:?usage: survey-nuget.sh PACKAGE_ID [OWNER/REPO]}"
LOWER=$(printf '%s' "$ID" | tr '[:upper:]' '[:lower:]')
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

section() { printf '\n## %s\n$ %s\n' "$1" "$2"; }
run() { section "$1" "$2"; eval "$2" 2>&1 || printf '(command failed: exit %s)\n' "$?"; }
json() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const f=new Function("r",process.argv[1]);try{f(JSON.parse(s))}catch(e){console.log("(parse failed: "+e.message+")")}})' "$1"; }

printf '# NuGet survey: %s (%s)\n' "$ID" "$(date -u +%Y-%m-%dT%H:%MZ)"

section "Versions (flat container, includes unlisted)" "curl -s https://api.nuget.org/v3-flatcontainer/$LOWER/index.json"
curl -s "https://api.nuget.org/v3-flatcontainer/$LOWER/index.json" | json 'console.log(r.versions.join(" "))'

section "Search entry: total downloads, verified owner, listed versions" "curl -s 'https://azuresearch-usnc.nuget.org/query?q=packageid:$ID&prerelease=true'"
search=$(curl -s "https://azuresearch-usnc.nuget.org/query?q=packageid:$ID&prerelease=true")
if [ -z "$search" ]; then
  # The search host can be unreachable (a cloud session's egress policy denied it on 2026-09-27); say so rather than
  # print a parse error, and point at the page that shows the same numbers.
  printf '(search API unreachable; read total downloads, per-version downloads and "Used By" at https://www.nuget.org/packages/%s)\n' "$ID"
else
  printf '%s' "$search" | json 'const p=r.data[0]; if(!p){console.log("(not found)");return} console.log(JSON.stringify({id:p.id, latest:p.version, totalDownloads:p.totalDownloads, verified:p.verified, owners:p.owners, authors:p.authors, license:p.licenseUrl, project:p.projectUrl, tags:p.tags, deprecation:p.deprecation??null, vulnerabilities:p.vulnerabilities??[]},null,1)); for(const v of p.versions) console.log(" "+v.version+" downloads="+v.downloads)'
fi

section "Registration index: per-version listed flag, published date, deprecation, target frameworks" "curl -s --compressed https://api.nuget.org/v3/registration5-gz-semver2/$LOWER/index.json"
curl -s --compressed "https://api.nuget.org/v3/registration5-gz-semver2/$LOWER/index.json" | json 'for(const page of r.items){ if(!page.items){console.log("(page not inlined: "+page["@id"]+")");continue} for(const it of page.items){const c=it.catalogEntry; console.log(c.version+" listed="+c.listed+" published="+(c.published||"").slice(0,10)+(c.deprecation?" DEPRECATED("+c.deprecation.reasons.join(",")+")":"")+(c.vulnerabilities?" VULN="+c.vulnerabilities.length:"")); for(const g of c.dependencyGroups||[]) console.log("   "+(g.targetFramework||"(any)")+": "+(g.dependencies||[]).map(d=>d.id+" "+d.range).join(", "))}}'

section "Package files of the latest version (nupkg is a zip)" "curl -s -o pkg.nupkg https://api.nuget.org/v3-flatcontainer/$LOWER/<version>/$LOWER.<version>.nupkg; unzip -l pkg.nupkg"
latest=$(curl -s "https://api.nuget.org/v3-flatcontainer/$LOWER/index.json" | json 'console.log(r.versions.at(-1))')
tmp=$(mktemp -d)
if curl -s -o "$tmp/pkg.nupkg" "https://api.nuget.org/v3-flatcontainer/$LOWER/$latest/$LOWER.$latest.nupkg"; then
  (cd "$tmp" && (unzip -l pkg.nupkg 2>/dev/null || python -c "import zipfile,sys;[print(i.file_size, i.filename) for i in zipfile.ZipFile('pkg.nupkg').infolist()]"))
  printf 'nuspec:\n'; (cd "$tmp" && (unzip -p pkg.nupkg '*.nuspec' 2>/dev/null || python -c "import zipfile;z=zipfile.ZipFile('pkg.nupkg');print(z.read([n for n in z.namelist() if n.endswith('.nuspec')][0]).decode())"))
fi
rm -rf "$tmp"

REPO="${2:-}"
if [ -z "$REPO" ]; then
  REPO=$(curl -s "https://azuresearch-usnc.nuget.org/query?q=packageid:$ID" | json 'const u=(r.data[0]||{}).projectUrl||""; const m=u.match(/github\.com\/([^\/]+\/[^\/.]+)/); console.log(m?m[1]:"")')
fi
if [ -n "$REPO" ]; then
  printf '\n# GitHub side (%s)\n' "$REPO"
  bash "$HERE/survey-github.sh" "$REPO"
else
  printf '\n(no GitHub repository found in the project URL; pass OWNER/REPO as the second argument)\n'
fi

printf '\n## Next: in the clone\n'
printf -- '- Read every .csproj, .sln or .slnx, Directory.Build.props, .nuspec, packages.config, global.json, the tests, the README and every dotfile.\n'
printf -- '- dotnet --list-sdks; dotnet restore; dotnet build; dotnet test as they are (an old project may need a .NET Framework reference assembly pack or the Windows SDK).\n'
printf -- '- dotnet list package --outdated --include-transitive; dotnet list package --vulnerable --include-transitive.\n'
printf -- '- Then the golden capture from the PUBLISHED package in a scratch console project (scripts/golden-capture-nuget.template.cs).\n'
