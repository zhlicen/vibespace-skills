#!/usr/bin/env bash
# preflight.sh — install a portable Node runtime into ./runtime (macOS, no sudo)
# Usage:  bash preflight.sh
# Prints the absolute path to the node binary on success. Idempotent: re-running is safe.

set -euo pipefail
NODE_VERSION="22.11.0"   # pinned LTS; keep in sync with SKILL.md and launcher

# 1. Detect CPU architecture
case "$(uname -m)" in
  arm64)  arch="arm64" ;;   # Apple Silicon
  x86_64) arch="x64" ;;     # Intel
  *)      arch="x64" ;;
esac

dist="node-v${NODE_VERSION}-darwin-${arch}"
url="https://nodejs.org/dist/v${NODE_VERSION}/${dist}.tar.gz"
runtime="$(pwd)/runtime"
node_bin="${runtime}/${dist}/bin/node"

# 2. Already installed? Done.
if [ -x "$node_bin" ]; then
  echo "NODE_PATH=${node_bin}"
  exit 0
fi

mkdir -p "$runtime"
tarball="${runtime}/${dist}.tar.gz"

# 3. Download
echo "Downloading ${url} ..."
curl -fL "$url" -o "$tarball"

# 4. Extract
echo "Extracting ..."
tar -xzf "$tarball" -C "$runtime"
rm -f "$tarball"

# 5. Verify
if [ ! -x "$node_bin" ]; then
  echo "ERROR: node binary not found at ${node_bin} after extraction." >&2
  echo "List runtime/ and update nodePath in project.json." >&2
  exit 1
fi
"$node_bin" --version
echo "NODE_PATH=${node_bin}"
