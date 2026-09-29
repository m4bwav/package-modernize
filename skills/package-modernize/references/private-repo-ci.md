# Private repositories: CI on the maintainer's own runner

Read in Phase 0, when the survey shows the repository is private or will be made private, and in Phase 2 before writing its workflows. Public repositories skip this page: their jobs on GitHub-hosted runners cost nothing.

## Why (checked 2026-09-29)

- On GitHub-hosted runners, jobs in a private repository use the account's included minutes and storage: 2,000 minutes and 500 MB a month on GitHub Free, 3,000 minutes and 1 GB on Pro. Artifacts and GitHub Packages share the storage allowance; caches do not. Windows minutes cost more than Linux minutes, and macOS minutes much more. ([GitHub Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions))
- Past the included amount, with no payment method or a $0 budget, GitHub stops starting hosted jobs. The run shows "The job was not started because recent account payments have failed or your spending limit needs to be increased".
- Jobs on a self-hosted runner use no minutes. On 2026-09-29 GitHub still started them while hosted jobs in the same account were blocked. A $0.002-a-minute charge on self-hosted minutes was announced for 2026-03-01 and then postponed "to re-evaluate our approach" ([changelog](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/)). This is a volatile claim: re-check it at every refresh.
- Artifacts uploaded from a self-hosted job still count against storage.
- A maintainer whose overlay says private builds run locally gets exactly that: no hosted runner for build, test or preview jobs, and no paying GitHub.

## Set up the runner (Windows)

`scripts/add-self-hosted-runner.ps1 -Repo OWNER/NAME -Label <short-label>` does all of it and is safe to run again:

- A personal account's runner serves one repository, so each private repository gets its own folder (default `D:\actions-runner-<label>`). A runner of another repository cannot take its jobs.
- It downloads the latest runner and registers it with the label.
- It writes `start.cmd`, which does three things before `run.cmd`:
  - puts Git's `bin` first on PATH. Without it, `shell: bash` finds WSL's `bash.exe` in WindowsApps on a normal PATH.
  - sets `AZURE_CONFIG_DIR` inside the runner folder. `azure/login` on a self-hosted runner otherwise writes into the user's own `az` profile, and its cleanup clears the account.
  - sets `MSBUILDDISABLENODEREUSE=1`.
- It registers a scheduled task that runs `start.cmd` at logon in the user's session. The runner then has the user's tools (gh, az, Node, the .NET SDK) and can open windows, which a service account cannot.
- It restarts the runner and prints its status.

The runner runs as the maintainer, with their files in reach. Keep it on repositories that take pull requests only from the maintainer and Dependabot. Never put a self-hosted runner on a public repository: anyone's pull request could run code on the machine.

## Workflows

- `runs-on: ${{ fromJSON(vars.RUNS_ON || '["self-hosted","<label>"]') }}` on every job, with `defaults: run: shell: bash`. The repository variable `RUNS_ON` set to `"ubuntu-latest"` (with the quotes) sends the jobs back to GitHub's runners without a code change, for when the machine is away.
- `actions/setup-node` and `actions/setup-dotnet` get `if: runner.environment == 'github-hosted'` when the machine already has the versions. On Windows, setup-dotnet installs into Program Files and would change the machine's SDK.
- `npm ci --ignore-scripts` when no dependency needs an install script (`npm query ':attr(scripts, [install]), :attr(scripts, [postinstall]), :attr(scripts, [preinstall])'` prints nothing). Dependabot's updates then build on the machine without running new packages' installers. Tests still run the new code, as a local build after the merge would.
- A runner takes one job at a time; while the machine is off or asleep, jobs queue for up to 24 hours. After a restart, the runner took about 5 minutes to pick up the first job (2026-09-29).
- Artifacts are small and short-lived: `retention-days: 1` for one handed to another workflow, test results only `if: failure()`. Delete old artifacts when the account nears its storage allowance: `gh api -X DELETE repos/OWNER/NAME/actions/artifacts/ID`.
- A cross-OS matrix narrows to what the machine runs (Windows, and Linux through WSL or a container only when set up). Say so in the plan's decisions table, and keep the golden and consumer tests on every OS the package claims before the release, on hosted runners if need be.
- A container image needs no Docker: the .NET SDK builds and pushes one with `dotnet publish -t:PublishContainer --os linux --arch x64 -p:ContainerRegistry=ghcr.io -p:ContainerRepository=... -p:ContainerImageTag=...`, with credentials from `DOTNET_CONTAINER_REGISTRY_UNAME` and `DOTNET_CONTAINER_REGISTRY_PWORD`. Labels go in `ContainerLabel` items in the project file. Check the image offline first with `-p:ContainerArchiveOutputPath=<file>.tar.gz`.
- A worker that hangs on start stalls the queue: twice on 2026-09-29 the runner spawned a worker that never took its job within the 30-second hand-off (no `_diag\Worker_*.log` written), then spent about 10 minutes killing it before failing the job, while every other job waited. Both came under a minute after another job ended, during a broker reconnect; a re-run on an idle runner passed. Read `_diag\Runner_*.log` for "Job request message sending ... been cancelled"; re-run the failed job; if it recurs, register a second runner with the same label (`-Label` the same, another `-Dir` and `-Name`) so one stuck job cannot block the rest.
- Pipes under `pipefail`: `curl ... | grep -q` fails with curl's exit 23 when grep stops early. On Ubuntu it can pass by luck of timing; on Windows it failed. Read into a variable, then grep.

## Publishing stays on GitHub-hosted runners

npm trusted publishing and provenance accept OIDC tokens from GitHub-hosted runners only ([npm docs](https://docs.npmjs.com/trusted-publishers/)). A private repository that publishes to npm keeps its release job on `ubuntu-latest`; that costs a few minutes a release. Otherwise, make the repository public before the release. Check the other registries' trusted-publishing pages for the same limit before relying on a self-hosted publish job.

Evidence: m4bwav/markdavidrogers-web PR #24 and `ai-docs/decisions/2026-09-29-self-hosted-runner.md` (CI and Preview green on the runner, 2026-09-29); L-135 `private-repo-ci-on-own-runner`.

Related: builds on [../SKILL.md](../SKILL.md); see also [../scripts/README.md](../scripts/README.md), [npm.md](npm.md), [nuget.md](nuget.md).
