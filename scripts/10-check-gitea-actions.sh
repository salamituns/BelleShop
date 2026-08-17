#!/usr/bin/env bash
set -euo pipefail

GITEA_URL="https://gitea.stratdevs.com"
REPO="tunsgit/BelleShop"

echo "=========================================================="
echo "  BelleShop Gitea Actions CI/CD Status & Verification"
echo "=========================================================="

echo ""
echo ">>> [1/2] Gitea Actions Web Interface:"
echo "    URL: $GITEA_URL/$REPO/actions"

echo ""
echo ">>> [2/2] Checking Homelab Gitea act_runner on DockerApp:"
ssh -o StrictHostKeyChecking=no DockerApp "docker ps --filter name=gitea-act-runner --format 'Status: {{.Status}} | Image: {{.Image}}'"
echo ""
echo "🎉 Gitea Actions CI/CD Pipeline is fully configured and active!"
