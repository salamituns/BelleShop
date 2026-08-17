#!/usr/bin/env bash
set -euo pipefail

JENKINS_URL="http://192.168.1.88:8080"
SONAR_URL="http://192.168.1.86:9000"
NEXUS_URL="http://192.168.1.87:8081"
GITEA_REPO="https://gitea.stratdevs.com/tunsgit/BelleShop.git"

echo "=========================================================="
echo "  BelleShop Enterprise CI/CD Pipeline Setup & Verification"
echo "=========================================================="

echo ""
echo ">>> [1/3] Verifying Homelab CI/CD Services Connectivity:"
echo -n "  • Jenkins (192.168.1.88:8080):  "
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$JENKINS_URL"
echo -n "  • SonarQube (192.168.1.86:9000): "
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$SONAR_URL"
echo -n "  • Nexus (192.168.1.87:8081):     "
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$NEXUS_URL"

echo ""
echo ">>> [2/3] CI/CD Pipeline Stages Configured in Jenkinsfile:"
echo "  1. 📥 Checkout: Clones repository from Gitea ($GITEA_REPO)"
echo "  2. 🧪 Unit Tests: Runs pytest on backend auth, tokens, and health checks"
echo "  3. 🛡️ SonarQube: Scans code security, bugs, and maintainability against $SONAR_URL"
echo "  4. 🐳 Docker Build: Builds hardened multi-stage container image v\${BUILD_NUMBER}"
echo "  5. 🚀 Cluster Deploy: Distributes image to cluster node containerd runtimes"
echo "  6. 🔄 GitOps Release: Commits new image tag to k8s/backend-rollout.yaml & triggers Argo Rollouts Canary!"

echo ""
echo ">>> [3/3] How to Create the Pipeline Job in Jenkins UI:"
echo "  1. Open Jenkins: $JENKINS_URL"
echo "  2. Click 'New Item' -> Enter name 'BelleShop-CI-CD' -> Select 'Pipeline'"
echo "  3. In Pipeline Definition, choose 'Pipeline script from SCM'"
echo "  4. SCM: Git -> Repository URL: $GITEA_REPO -> Branch: */main"
echo "  5. Script Path: Jenkinsfile"
echo "  6. Click Save and click 'Build Now' to trigger your first automated CI/CD run!"
