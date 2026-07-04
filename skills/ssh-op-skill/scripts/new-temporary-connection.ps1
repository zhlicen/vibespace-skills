[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$HostName,
    [Parameter(Mandatory)][string]$User,
    [ValidateRange(1, 65535)][int]$Port = 22,
    [ValidateSet('key', 'password', 'agent')][string]$AuthType = 'agent',
    [string]$AuthReference,
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')

if ($AuthType -ne 'agent' -and [string]::IsNullOrWhiteSpace($AuthReference)) {
    throw 'AuthReference is required for key and password authentication.'
}

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$statePath = Join-Path $runtimeRoot 'runtime.json'
$state = Read-SshOpsJson -Path $statePath
$auth = [ordered]@{ type = $AuthType }
if ($AuthType -eq 'key') { $auth.key_ref = $AuthReference }
if ($AuthType -eq 'password') { $auth.secret_ref = $AuthReference }

$state.current_connection = [ordered]@{
    kind = 'temporary'
    status = 'selected'
    selected_at = [DateTimeOffset]::Now.ToString('o')
    endpoint = [ordered]@{
        host = $HostName
        port = $Port
        user = $User
        auth = $auth
    }
}
Write-SshOpsJson -Value $state -Path $statePath
& (Join-Path $PSScriptRoot 'show-connection.ps1') -RuntimePath $runtimeRoot
