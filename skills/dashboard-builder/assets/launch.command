#!/usr/bin/env bash
# launch.command - one-click dashboard launcher (macOS)
# The agent bakes in the correct node path at handoff (Stage 8), then runs: chmod +x launch.command
# Double-click this file to start the dashboard and open it in the browser.

cd "$(dirname "$0")"
NODE="runtime/node-v22.11.0-darwin-$(uname -m | sed 's/x86_64/x64/;s/arm64/arm64/')/bin/node"

if [ ! -x "$NODE" ]; then
  echo "Could not find the runtime. Please ask the person who set this up to run preflight again."
  read -r -p "Press Enter to close."
  exit 1
fi

# open the browser shortly after the server starts
( sleep 2; open http://localhost:3200 ) &

echo "Starting dashboard... keep this window open. Close it to stop the dashboard."
"$NODE" server.js
