[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Alias,
    [ValidateSet('selected', 'verified', 'failed')][string]$Status = 'selected',
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')
Assert-SshOpsAlias -Alias $Alias

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$statePath = Join-Path $runtimeRoot 'runtime.json'
$hostPath = Join-Path $runtimeRoot "inventory\hosts\$Alias.json"
if (-not (Test-Path -LiteralPath $hostPath)) {
    throw "Favorite not found: $Alias"
}

$state = Read-SshOpsJson -Path $statePath
$now = [DateTimeOffset]::Now.ToString('o')
$connection = [ordered]@{
    kind = 'favorite'
    host_ref = $Alias
    status = $Status
    selected_at = $now
}
if ($Status -eq 'verified') {
    $connection.last_verified_at = $now
}
$state.current_connection = $connection
Write-SshOpsJson -Value $state -Path $statePath
& (Join-Path $PSScriptRoot 'show-connection.ps1') -RuntimePath $runtimeRoot
