#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "  BelleShop Homelab: [3/4] Join Worker Nodes"
echo "========================================================"

echo ">>> [1/3] Generating fresh token & join command from Master..."
JOIN_CMD=$(ssh Master "sudo kubeadm token create --print-join-command")
echo "Extracted command: $JOIN_CMD"

echo ">>> [2/3] Joining WorkerNode1 (192.168.1.89)..."
ssh -t WorkerNode1 "sudo $JOIN_CMD"

echo ">>> [3/3] Joining WorkerNode2 (192.168.1.84)..."
ssh -t WorkerNode2 "sudo $JOIN_CMD"

echo ""
echo "=== Cluster Nodes Status ==="
ssh Master "kubectl get nodes -o wide"
