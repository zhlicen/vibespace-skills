[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Alias,
    [Parameter(Mandatory)][string]$HostName,
    [Parameter(Mandatory)][string]$User,
    [ValidateRange(1, 65535)][int]$Port = 22,
    [ValidateSet('key', 'password', 'agent')][string]$AuthType = 'agent',
    [string]$AuthReference,
    [string[]]$Groups = @(),
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')
Assert-SshOpsAlias -Alias $Alias

if ($AuthType -ne 'agent' -and [string]::IsNullOrWhiteSpace($AuthReference)) {
    throw 'AuthReference is required for key and password authentication.'
}

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$hostDirectory = Join-Path $runtimeRoot 'inventory\hosts'
New-Item -ItemType Directory -Force -Path $hostDirectory | Out-Null
$auth = [ordered]@{ type = $AuthType }
if ($AuthType -eq 'key') { $auth.key_ref = $AuthReference }
if ($AuthType -eq 'password') { $auth.secret_ref = $AuthReference }

$profile = [ordered]@{
    alias = $Alias
    host = $HostName
    port = $Port
    user = $User
    groups = @($Groups)
    auth = $auth
}
Write-SshOpsJson -Value $profile -Path (Join-Path $hostDirectory "$Alias.json")
Write-Output "Favorite saved: $Alias"
