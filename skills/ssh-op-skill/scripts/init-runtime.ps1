[CmdletBinding()]
param([string]$RuntimePath)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')

$target = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$template = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets\runtime-template'

$directories = @(
    'inventory\hosts', 'facts', 'secrets\credentials', 'secrets\keys',
    'policies', 'logs', 'skills', 'cache', 'locks'
)

New-Item -ItemType Directory -Force -Path $target | Out-Null
foreach ($directory in $directories) {
    New-Item -ItemType Directory -Force -Path (Join-Path $target $directory) | Out-Null
}

Get-ChildItem -LiteralPath $template -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($template.Length).TrimStart('\')
    $destination = Join-Path $target $relative
    $parent = Split-Path $destination -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    if (-not (Test-Path -LiteralPath $destination)) {
        Copy-Item -LiteralPath $_.FullName -Destination $destination
    }
}

Write-Output "SSH Ops Runtime ready: $target"
