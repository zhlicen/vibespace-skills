[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Alias,
    [Parameter(Mandatory)][ValidateNotNullOrEmpty()][string[]]$Groups,
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')
Assert-SshOpsAlias -Alias $Alias
if (@($Groups | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count -eq 0) {
    throw 'At least one non-empty group/category is required.'
}

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$statePath = Join-Path $runtimeRoot 'runtime.json'
$state = Read-SshOpsJson -Path $statePath
$current = $state.current_connection
if ($null -eq $current -or $current.kind -ne 'temporary') {
    throw 'The current connection is not temporary.'
}

$hostDirectory = Join-Path $runtimeRoot 'inventory\hosts'
New-Item -ItemType Directory -Force -Path $hostDirectory | Out-Null
$hostPath = Join-Path $hostDirectory "$Alias.json"
if (Test-Path -LiteralPath $hostPath) {
    throw "Favorite already exists: $Alias"
}

$profile = [ordered]@{
    alias = $Alias
    host = $current.endpoint.host
    port = $current.endpoint.port
    user = $current.endpoint.user
    groups = @($Groups | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    auth = $current.endpoint.auth
}
Write-SshOpsJson -Value $profile -Path $hostPath

$favorite = [ordered]@{
    kind = 'favorite'
    host_ref = $Alias
    status = $current.status
    selected_at = [DateTimeOffset]::Now.ToString('o')
}
if ($current.status -eq 'verified' -and $null -ne $current.last_verified_at) {
    $favorite.last_verified_at = $current.last_verified_at
}
$state.current_connection = $favorite
Write-SshOpsJson -Value $state -Path $statePath
& (Join-Path $PSScriptRoot 'show-connection.ps1') -RuntimePath $runtimeRoot
