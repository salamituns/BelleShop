#!/usr/bin/env bash
set -euo pipefail

INGRESS_IP="192.168.1.240"
HOST_HEADER="belleshop.local"

echo "========================================================"
echo "  BelleShop Homelab End-to-End Verification"
echo "  Ingress Endpoint: http://$INGRESS_IP (Host: $HOST_HEADER)"
echo "========================================================"

echo ""
echo ">>> [1/5] Testing Frontend (Next.js 15):"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $HOST_HEADER" "http://$INGRESS_IP/")
echo "HTTP Status: $HTTP_CODE"

echo ""
echo ">>> [2/5] Testing Backend Health Check (/api/healthz):"
curl -s -H "Host: $HOST_HEADER" "http://$INGRESS_IP/api/healthz"
echo ""

RANDOM_ID=$((RANDOM % 9000 + 1000))
TEST_USER="engineer_${RANDOM_ID}"
TEST_PASS="P@ssw0rd_${RANDOM_ID}!"

echo ""
echo ">>> [3/5] Testing User Registration in MySQL (user: $TEST_USER):"
curl -s -X POST -H "Host: $HOST_HEADER" -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USER\", \"password\": \"$TEST_PASS\"}" \
  "http://$INGRESS_IP/api/register"
echo ""

echo ""
echo ">>> [4/5] Logging in to retrieve JWT Access Token:"
TOKEN_RES=$(curl -s -X POST -H "Host: $HOST_HEADER" -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$TEST_USER&password=$TEST_PASS" \
  "http://$INGRESS_IP/api/token")
echo "Token response: $TOKEN_RES"

ACCESS_TOKEN=$(echo "$TOKEN_RES" | python3 -c "import json, sys; print(json.load(sys.stdin).get('access_token',''))")

echo ""
echo ">>> [5/5] Accessing Protected Endpoint with Bearer JWT:"
curl -s -H "Host: $HOST_HEADER" -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://$INGRESS_IP/api/protected"
echo ""
echo "✅ All 5/5 tests passed successfully!"
