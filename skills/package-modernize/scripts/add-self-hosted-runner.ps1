<#
.SYNOPSIS
Gives one private repository a GitHub Actions self-hosted runner on this Windows machine, started at logon.

.DESCRIPTION
A private repository's jobs on GitHub-hosted runners use the account's paid minutes and storage;
self-hosted jobs use none (references/private-repo-ci.md). A personal account's runner serves one
repository, so each private repository gets its own runner folder. This script:

  1. downloads the latest runner (actions/runner releases) into -Dir, unless it is there already;
  2. registers it to -Repo with the label -Label (skipped when -Dir is already registered);
  3. writes start.cmd: Git's bin first on PATH (otherwise `shell: bash` finds WSL's bash.exe in
     WindowsApps), AZURE_CONFIG_DIR inside the runner folder (azure/login must not touch the
     user's own az sign-in; its cleanup clears the account), MSBUILDDISABLENODEREUSE=1;
  4. registers the scheduled task "GitHub Actions Runner (<repo name>)" that runs start.cmd at logon in
     the user's session (so jobs see the user's tools and can open windows), and (re)starts it;
  5. prints the runner as GitHub sees it.

Workflows then use: runs-on: ${{ fromJSON(vars.RUNS_ON || '["self-hosted","<label>"]') }}

.EXAMPLE
pwsh -File add-self-hosted-runner.ps1 -Repo m4bwav/markdavidrogers-web -Label mdr
#>
param(
  [Parameter(Mandatory)] [string] $Repo,
  [Parameter(Mandatory)] [string] $Label,
  [string] $Dir = "D:\actions-runner-$Label",
  [string] $GitBin = 'C:\Program Files\Git\bin',
  [string] $Name = "$env:COMPUTERNAME-$Label"
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path "$GitBin\bash.exe")) { throw "No bash.exe in $GitBin; pass -GitBin" }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'gh is needed (signed in with admin rights on the repository)' }

# 1. The runner package.
if (-not (Test-Path "$Dir\config.cmd")) {
  New-Item -ItemType Directory -Force $Dir | Out-Null
  $asset = (gh api repos/actions/runner/releases/latest | ConvertFrom-Json).assets |
    Where-Object name -like 'actions-runner-win-x64-*.zip' | Select-Object -First 1
  $zip = Join-Path $Dir $asset.name
  Write-Host "downloading $($asset.name)"
  Invoke-WebRequest $asset.browser_download_url -OutFile $zip
  Expand-Archive $zip $Dir -Force
}

# 2. Registration (a registered folder keeps its registration; remove it with config.cmd remove first to move it).
if (-not (Test-Path "$Dir\.runner")) {
  $token = gh api -X POST "repos/$Repo/actions/runners/registration-token" -q .token
  Push-Location $Dir
  try { & .\config.cmd --unattended --url "https://github.com/$Repo" --token $token --name $Name --labels $Label --work _work --replace }
  finally { Pop-Location }
  if ($LASTEXITCODE) { throw "config.cmd failed ($LASTEXITCODE)" }
} else { Write-Host "$Dir is registered already: $((Get-Content "$Dir\.runner" -Raw | ConvertFrom-Json).gitHubUrl)" }

# 3. start.cmd
@"
@echo off
rem Starts the self-hosted runner for $Repo (written by package-modernize's add-self-hosted-runner.ps1).
rem Git's bash goes first on PATH so workflow steps with "shell: bash" get Git Bash, not WSL's bash.exe.
set "PATH=$GitBin;%PATH%"
rem azure/login in a job must not touch the user's own az sign-in (its cleanup clears the account).
set "AZURE_CONFIG_DIR=%~dp0_azure"
set "MSBUILDDISABLENODEREUSE=1"
cd /d "%~dp0"
call run.cmd
"@ | Set-Content "$Dir\start.cmd" -Encoding ascii

# 4. The logon task, then a restart so the runner picks up start.cmd.
$task = "GitHub Actions Runner ($($Repo.Split('/')[1]))"
$user = "$env:USERDOMAIN\$env:USERNAME"
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$trigger.Delay = 'PT1M'
Register-ScheduledTask -TaskName $task -Force `
  -Description "Starts the self-hosted GitHub Actions runner for $Repo ($Dir\start.cmd), so its private builds run here instead of on paid GitHub-hosted runners." `
  -Action (New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"$Dir\start.cmd`"" -WorkingDirectory $Dir) `
  -Trigger $trigger `
  -Principal (New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive) `
  -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5) -MultipleInstances IgnoreNew) | Out-Null
Get-CimInstance Win32_Process -Filter "Name='Runner.Listener.exe' or Name='Runner.Worker.exe'" |
  Where-Object { $_.ExecutablePath -like "$Dir\*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Stop-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
Start-ScheduledTask -TaskName $task

# 5. What GitHub sees (the listener takes a few seconds to connect).
for ($i = 0; $i -lt 12; $i++) {
  Start-Sleep 5
  $status = gh api "repos/$Repo/actions/runners" -q ".runners[] | select(.name == `"$Name`") | .status"
  if ($status -eq 'online') { break }
}
Write-Host "runner $Name for $Repo`: $status (task '$task', folder $Dir)"
Write-Host "workflows: runs-on: `${{ fromJSON(vars.RUNS_ON || '[`"self-hosted`",`"$Label`"]') }}"
