[CmdletBinding()]
param([Parameter(Mandatory)][string]$Path)

$ErrorActionPreference = 'Stop'
$resolved = (Resolve-Path -LiteralPath $Path).Path
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name

& icacls.exe $resolved /inheritance:r /grant:r "${identity}:(F)" | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to protect private key ACL: $resolved"
}
Write-Output "Private key ACL restricted to $identity."
