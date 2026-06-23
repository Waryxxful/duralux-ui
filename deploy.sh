#!/usr/bin/env bash
set -euo pipefail

# Build and run the production demo container (nginx)
docker-compose build demo
docker-compose up -d demo

echo "Demo started: http://<HOST_IP>:5200 (mapea 5200 -> nginx:80)"
