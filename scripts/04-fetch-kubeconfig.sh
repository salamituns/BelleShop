#!/usr/bin/env bash
set -euo pipefail

MASTER_IP="192.168.1.90"
LOCAL_KUBEDIR="$HOME/.kube"
LOCAL_CONFIG="$LOCAL_KUBEDIR/config-homelab"

echo "========================================================"
echo "  BelleShop Homelab: [4/4] Configure Local Mac Kubectl"
echo "========================================================"

mkdir -p "$LOCAL_KUBEDIR"

echo ">>> Fetching cluster admin kubeconfig from Master..."
ssh Master "cat \$HOME/.kube/config" > "$LOCAL_CONFIG"
chmod 600 "$LOCAL_CONFIG"

# Ensure the cluster server endpoint is pointing to Master IP
sed -i '' "s|server: https://.*:6443|server: https://$MASTER_IP:6443|g" "$LOCAL_CONFIG"

echo "✅ Saved homelab kubeconfig to $LOCAL_CONFIG"
echo ""
echo ">>> Testing local kubectl connection from your Mac:"
KUBECONFIG="$LOCAL_CONFIG" kubectl get nodes -o wide
echo ""
echo ">>> Cluster pods in kube-system:"
KUBECONFIG="$LOCAL_CONFIG" kubectl get pods -n kube-system
