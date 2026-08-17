#!/usr/bin/env bash
set -euo pipefail

echo "========================================================="
echo "  BelleShop Argo Rollouts Progressive Delivery Demo"
echo "========================================================="

echo ""
echo ">>> [1/4] Current Rollout State & Healthy Pods:"
kubectl argo rollouts get rollout backend -n dev --watch=false

echo ""
echo ">>> [2/4] Triggering Progressive Canary Rollout to 'belleshop-backend:v2'..."
kubectl argo rollouts set image backend backend=belleshop-backend:v2 -n dev

echo ""
echo ">>> [3/4] Observing Ingress-Nginx Canary Weights & Step Progression:"
for i in {1..8}; do
  kubectl argo rollouts get rollout backend -n dev --watch=false | grep -E "SetWeight|ActualWeight|Status|Step"
  sleep 5
done

echo ""
echo ">>> [4/4] Final Rollout Promotion State:"
kubectl argo rollouts status backend -n dev --timeout 60s
echo ""
echo "🎉 Canary Progressive Delivery successfully demonstrated!"
echo "Argo Rollouts Dashboard: http://192.168.1.243:3100 (or http://rollouts.local)"
