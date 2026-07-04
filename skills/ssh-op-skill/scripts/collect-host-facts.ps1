[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Alias,
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')
Assert-SshOpsAlias -Alias $Alias

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$hostPath = Join-Path $runtimeRoot "inventory\hosts\$Alias.json"
if (-not (Test-Path -LiteralPath $hostPath)) { throw "Favorite not found: $Alias" }
$profile = Read-SshOpsJson -Path $hostPath

$sshArgs = @('-o', 'ConnectTimeout=10', '-p', [string]$profile.port)
if ($profile.auth.type -eq 'key') {
    $keyRef = [string]$profile.auth.key_ref
    if ($keyRef.StartsWith('runtime-key:')) {
        $keyName = $keyRef.Substring('runtime-key:'.Length)
        $sshArgs += @('-i', (Join-Path $runtimeRoot "secrets\keys\$keyName"))
    } else {
        throw 'Only runtime-key references are supported by this collector.'
    }
} elseif ($profile.auth.type -eq 'password') {
    throw 'Password collection requires the interactive SSH workflow; do not expose a password in arguments.'
}

$sshArgs += "$($profile.user)@$($profile.host)"
$remoteCommand = @'
printf 'hostname=%s\n' "$(hostname)"
printf 'kernel=%s\n' "$(uname -s)"
printf 'architecture=%s\n' "$(uname -m)"
if test -r /etc/os-release; then
  . /etc/os-release
  printf 'os_name=%s\n' "$NAME"
  printf 'os_version=%s\n' "$VERSION_ID"
fi
'@
$output = & ssh @sshArgs $remoteCommand
if ($LASTEXITCODE -ne 0) { throw "SSH fact collection failed for $Alias" }

$data = [ordered]@{}
foreach ($line in $output) {
    if ($line -match '^([^=]+)=(.*)$') { $data[$Matches[1]] = $Matches[2] }
}
$fact = [ordered]@{
    host_ref = $Alias
    collected_at = [DateTimeOffset]::Now.ToString('o')
    source = 'ssh baseline probe'
    data = $data
}
$factDirectory = Join-Path $runtimeRoot 'facts'
New-Item -ItemType Directory -Force -Path $factDirectory | Out-Null
Write-SshOpsJson -Value $fact -Path (Join-Path $factDirectory "$Alias.json")
Write-Output "Facts refreshed: $Alias"
