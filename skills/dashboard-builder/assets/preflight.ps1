# preflight.ps1 — install a portable Node runtime into ./runtime (Windows, no admin)
# Usage:  powershell -ExecutionPolicy Bypass -File preflight.ps1
# Prints the absolute path to node.exe on success. Idempotent: re-running is safe.

$ErrorActionPreference = "Stop"
$NodeVersion = "22.11.0"   # pinned LTS; keep in sync with SKILL.md and launcher

# 1. Detect CPU architecture
switch ($env:PROCESSOR_ARCHITECTURE) {
  "AMD64" { $arch = "x64" }
  "ARM64" { $arch = "arm64" }
  default { $arch = "x64" }   # sensible default for older shells
}

$dist    = "node-v$NodeVersion-win-$arch"
$zipUrl  = "https://nodejs.org/dist/v$NodeVersion/$dist.zip"
$runtime = Join-Path (Get-Location) "runtime"
$nodeExe = Join-Path $runtime "$dist\node.exe"

# 2. Already installed? Done.
if (Test-Path $nodeExe) {
  Write-Output "NODE_PATH=$nodeExe"
  exit 0
}

New-Item -ItemType Directory -Force -Path $runtime | Out-Null
$zipPath = Join-Path $runtime "$dist.zip"

# 3. Download (TLS 1.2 for older Windows)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Output "Downloading $zipUrl ..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

# 4. Extract
Write-Output "Extracting ..."
Expand-Archive -Path $zipPath -DestinationPath $runtime -Force
Remove-Item $zipPath -Force

# 5. Verify
if (-not (Test-Path $nodeExe)) {
  Write-Error "Node binary not found at $nodeExe after extraction. List runtime/ and update nodePath."
  exit 1
}
& $nodeExe --version
Write-Output "NODE_PATH=$nodeExe"
