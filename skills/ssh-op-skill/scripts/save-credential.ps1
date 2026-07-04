[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidatePattern('^[a-z0-9][a-z0-9.-]*$')][string]$Name,
    [PSCredential]$Credential,
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')

if (-not $IsWindows -and $PSVersionTable.PSEdition -eq 'Core') {
    throw 'DPAPI credential storage is implemented for Windows only.'
}
if ($null -eq $Credential) {
    $Credential = Get-Credential -Message "Credential for $Name"
}

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$directory = Join-Path $runtimeRoot 'secrets\credentials'
New-Item -ItemType Directory -Force -Path $directory | Out-Null
$path = Join-Path $directory "$Name.clixml"
$Credential | Export-Clixml -LiteralPath $path
Write-Output "Stored DPAPI credential '$Name'."
