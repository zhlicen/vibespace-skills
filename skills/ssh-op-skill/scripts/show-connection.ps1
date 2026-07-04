[CmdletBinding()]
param([string]$RuntimePath)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib\Runtime.ps1')

$runtimeRoot = Get-SshOpsRuntimePath -RuntimePath $RuntimePath
$statePath = Join-Path $runtimeRoot 'runtime.json'
if (-not (Test-Path -LiteralPath $statePath)) {
    Write-Output '[SSH Ops | disconnected] Create a connection or select one from favorites.'
    exit 0
}

$state = Read-SshOpsJson -Path $statePath
$current = $state.current_connection
if ($null -eq $current) {
    Write-Output '[SSH Ops | disconnected] Create a connection or select one from favorites.'
    exit 0
}

$connectionKind = if ($current.PSObject.Properties.Name -contains 'kind') { $current.kind } else { 'favorite' }
if ($connectionKind -eq 'temporary') {
    $endpoint = "$($current.endpoint.user)@$($current.endpoint.host):$($current.endpoint.port)"
    switch ($current.status) {
        'verified' {
            Write-Output "[SSH Ops | temporary | $endpoint | verified $($current.last_verified_at)]"
        }
        'failed' {
            Write-Output "[SSH Ops | temporary | $endpoint | last verification failed]"
        }
        default {
            Write-Output "[SSH Ops | temporary | $endpoint | selected, not verified]"
        }
    }
    exit 0
}

$hostPath = Join-Path $runtimeRoot "inventory\hosts\$($current.host_ref).json"
if (-not (Test-Path -LiteralPath $hostPath)) {
    Write-Output "[SSH Ops | $($current.host_ref) | favorite missing | last verification failed]"
    exit 1
}

$hostProfile = Read-SshOpsJson -Path $hostPath
$endpoint = "$($hostProfile.user)@$($hostProfile.host):$($hostProfile.port)"
switch ($current.status) {
    'verified' {
        Write-Output "[SSH Ops | $($current.host_ref) | $endpoint | verified $($current.last_verified_at)]"
    }
    'failed' {
        Write-Output "[SSH Ops | $($current.host_ref) | $endpoint | last verification failed]"
    }
    default {
        Write-Output "[SSH Ops | $($current.host_ref) | $endpoint | selected, not verified]"
    }
}
