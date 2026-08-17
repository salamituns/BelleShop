#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "  BelleShop Homelab: [1/4] Reset Cluster Nodes"
echo "========================================================"

echo ">>> [1/3] Resetting WorkerNode1 (192.168.1.89)..."
ssh -t WorkerNode1 "sudo kubeadm reset -f && sudo rm -rf /etc/cni/net.d \$HOME/.kube && sudo iptables -F && sudo iptables -t nat -F && sudo iptables -t mangle -F && sudo iptables -X || true"

echo ">>> [2/3] Resetting WorkerNode2 (192.168.1.84)..."
ssh -t WorkerNode2 "sudo kubeadm reset -f && sudo rm -rf /etc/cni/net.d \$HOME/.kube && sudo iptables -F && sudo iptables -t nat -F && sudo iptables -t mangle -F && sudo iptables -X || true"

echo ">>> [3/3] Resetting Master (192.168.1.90)..."
ssh -t Master "sudo kubeadm reset -f && sudo rm -rf /etc/cni/net.d \$HOME/.kube /etc/kubernetes/manifests/*.yaml && sudo iptables -F && sudo iptables -t nat -F && sudo iptables -t mangle -F && sudo iptables -X || true"

echo ""
echo "✅ All nodes successfully cleaned and reset."
