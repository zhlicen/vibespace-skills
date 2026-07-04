[CmdletBinding()]
param([string]$RuntimePath)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$statePath = Join-Path $runtimeRoot 'runtime.json'
$state = Read-SshOpsJson -Path $statePath
$state.current_connection = $null
Write-SshOpsJson -Value $state -Path $statePath
& (Join-Path $PSScriptRoot 'show-connection.ps1') -RuntimePath $runtimeRoot
