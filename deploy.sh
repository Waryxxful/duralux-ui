#!/usr/bin/env bash
set -euo pipefail

if docker compose version >/dev/null 2>&1; then
  compose=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  compose=(docker-compose)
else
  echo "Docker Compose is required to deploy the demo." >&2
  exit 1
fi

# Build and run the production demo container (nginx).
"${compose[@]}" build demo
"${compose[@]}" up -d demo

echo "Storybook publicado: http://<HOST_IP>:5200 (mapea 5200 -> nginx:80)"
