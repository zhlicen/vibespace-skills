Set-StrictMode -Version Latest

function Get-SshOpsSkillRoot {
    $scriptsRoot = Split-Path $PSScriptRoot -Parent
    return Split-Path $scriptsRoot -Parent
}

function Get-SshOpsRuntimePath {
    param([string]$RuntimePath)

    if ($RuntimePath) {
        return [IO.Path]::GetFullPath($RuntimePath)
    }
    if ($env:SSH_OPS_RUNTIME) {
        return [IO.Path]::GetFullPath($env:SSH_OPS_RUNTIME)
    }
    return Join-Path (Get-SshOpsSkillRoot) 'runtime'
}

function Read-SshOpsJson {
    param([Parameter(Mandatory)][string]$Path)
    return Get-Content -Raw -LiteralPath $Path | ConvertFrom-Json
}

function Write-SshOpsJson {
    param(
        [Parameter(Mandatory)]$Value,
        [Parameter(Mandatory)][string]$Path
    )
    $Value | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $Path -Encoding utf8
}

function Assert-SshOpsAlias {
    param([Parameter(Mandatory)][string]$Alias)
    if ($Alias -notmatch '^[a-z0-9][a-z0-9.-]*$') {
        throw "Invalid alias '$Alias'. Use lowercase letters, digits, dots, and hyphens."
    }
}
