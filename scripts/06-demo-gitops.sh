#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "  BelleShop GitOps & Self-Healing Live Demonstration"
echo "========================================================"

echo ""
echo ">>> [1/4] Checking ArgoCD Application Health & Sync Status:"
kubectl get application -n argocd -o wide

echo ""
echo ">>> [2/4] Simulating Human Error (Drift Injection):"
echo "Scaling deployment/backend to 5 replicas directly on the cluster..."
kubectl scale deployment backend --replicas=5 -n dev
kubectl get deployment backend -n dev

echo ""
echo ">>> [3/4] Observing ArgoCD Automated Drift Detection & Self-Healing:"
for i in {1..15}; do
  REPLICAS=$(kubectl get deployment backend -n dev -o jsonpath='{.spec.replicas}')
  echo "Current spec.replicas: $REPLICAS"
  if [ "$REPLICAS" -eq 2 ]; then
    echo "🎉 SUCCESS: ArgoCD reconciled the state back to Git (2 replicas)!"
    break
  fi
  sleep 2
done

echo ""
echo ">>> [4/4] Simulating Accidental Service Deletion:"
kubectl delete service frontend -n dev
echo "Checking service status immediately after deletion:"
kubectl get service frontend -n dev 2>&1 || true

echo "Waiting for ArgoCD self-healing to recreate service/frontend..."
for i in {1..15}; do
  if kubectl get service frontend -n dev >/dev/null 2>&1; then
    echo "🎉 SUCCESS: ArgoCD recreated the missing service/frontend from Git!"
    kubectl get service frontend -n dev
    break
  fi
  sleep 2
done
