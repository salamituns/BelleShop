#!/usr/bin/env bash
set -euo pipefail

MASTER_IP="192.168.1.90"
POD_CIDR="10.244.0.0/16"

echo "========================================================"
echo "  BelleShop Homelab: [2/4] Initialize Master Control Plane"
echo "========================================================"

echo ">>> [1/3] Running kubeadm init on Master ($MASTER_IP)..."
ssh -t Master "sudo kubeadm init --apiserver-advertise-address=$MASTER_IP --pod-network-cidr=$POD_CIDR --cri-socket=unix:///run/containerd/containerd.sock"

echo ">>> [2/3] Configuring user kubeconfig for tunsadmin on Master..."
ssh -t Master "mkdir -p \$HOME/.kube && sudo cp -f /etc/kubernetes/admin.conf \$HOME/.kube/config && sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"

echo ">>> [3/3] Deploying Flannel CNI overlay network..."
ssh -t Master "kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml"

echo ""
echo "✅ Control plane initialized and Flannel CNI applied!"
