[CmdletBinding()]
param([string]$RuntimePath)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$errors = [Collections.Generic.List[string]]::new()
$required = @(
    'runtime.json', 'inventory\hosts', 'inventory\groups.json', 'facts',
    'secrets\credentials', 'secrets\keys', 'policies\local-policy.md',
    'logs', 'skills\index.json', 'cache', 'locks'
)

foreach ($item in $required) {
    if (-not (Test-Path -LiteralPath (Join-Path $runtimeRoot $item))) {
        $errors.Add("Missing: $item")
    }
}

if (Test-Path -LiteralPath (Join-Path $runtimeRoot 'runtime.json')) {
    try {
        $state = Read-SshOpsJson -Path (Join-Path $runtimeRoot 'runtime.json')
        if ($state.schema_version -ne 1) { $errors.Add('Unsupported schema_version.') }
        if ($state.platform -ne 'windows') { $errors.Add('Only platform=windows is implemented.') }
        if ($null -ne $state.current_connection) {
            $connectionKind = if ($state.current_connection.PSObject.Properties.Name -contains 'kind') { $state.current_connection.kind } else { 'favorite' }
            if ($connectionKind -eq 'temporary') {
                foreach ($field in @('host', 'port', 'user', 'auth')) {
                    if ($null -eq $state.current_connection.endpoint.$field) {
                        $errors.Add("Temporary connection is missing endpoint.$field")
                    }
                }
            } else {
                $hostPath = Join-Path $runtimeRoot "inventory\hosts\$($state.current_connection.host_ref).json"
                if (-not (Test-Path -LiteralPath $hostPath)) { $errors.Add('Current favorite does not exist.') }
            }
        }
    } catch {
        $errors.Add("Invalid runtime.json: $($_.Exception.Message)")
    }
}

Get-ChildItem -LiteralPath (Join-Path $runtimeRoot 'inventory\hosts') -Filter '*.json' -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $hostProfile = Read-SshOpsJson -Path $_.FullName
        foreach ($field in @('alias', 'host', 'port', 'user', 'auth')) {
            if ($null -eq $hostProfile.$field) { $errors.Add("$($_.Name): missing $field") }
        }
    } catch {
        $errors.Add("$($_.Name): invalid JSON")
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}
Write-Output "Runtime valid: $runtimeRoot"
