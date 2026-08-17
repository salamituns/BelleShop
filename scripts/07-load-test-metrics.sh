#!/usr/bin/env bash
set -euo pipefail

INGRESS_IP="192.168.1.240"
HOST_HEADER="belleshop.local"
CONCURRENCY=5
ITERATIONS=30

echo "========================================================="
echo "  BelleShop SRE Traffic Generator & Golden Signals Injector"
echo "  Target: http://$INGRESS_IP (Host: $HOST_HEADER)"
echo "========================================================="

echo ""
echo "🚀 Generating mixed traffic to populate the 4 Golden Signals:"
echo "   - ⏱️ Latency: Measuring FastAPI request durations"
echo "   - 📈 Traffic: Generating requests across all endpoints"
echo "   - ⚠️ Errors: Simulating 4xx & 5xx responses"
echo "   - 📊 Saturation: Exercising CPU & RAM on worker nodes"
echo ""

# Function to run random traffic mix
send_traffic() {
  local id=$1
  for ((i=1; i<=ITERATIONS; i++)); do
    # 1. Health check (200 OK)
    curl -s -o /dev/null -H "Host: $HOST_HEADER" "http://$INGRESS_IP/api/healthz"
    
    # 2. Frontend load (200 OK)
    curl -s -o /dev/null -H "Host: $HOST_HEADER" "http://$INGRESS_IP/"
    
    # 3. User registration (200 OK)
    USER="user_${id}_${i}_$((RANDOM % 1000))"
    curl -s -o /dev/null -X POST -H "Host: $HOST_HEADER" -H "Content-Type: application/json" \
      -d "{\"username\": \"$USER\", \"password\": \"SREPass123!\"}" \
      "http://$INGRESS_IP/api/register"
      
    # 4. Token login (200 OK)
    curl -s -o /dev/null -X POST -H "Host: $HOST_HEADER" -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=$USER&password=SREPass123!" \
      "http://$INGRESS_IP/api/token"
      
    # 5. Simulated 401 Unauthorized Error (Error Rate signal)
    curl -s -o /dev/null -H "Host: $HOST_HEADER" -H "Authorization: Bearer invalid_jwt_token" \
      "http://$INGRESS_IP/api/protected"

    # 6. Simulated 404 Not Found
    curl -s -o /dev/null -H "Host: $HOST_HEADER" "http://$INGRESS_IP/api/nonexistent_endpoint"
  done
}

echo ">>> Launching $CONCURRENCY parallel workers generating $ITERATIONS cycles each..."
for ((w=1; w<=CONCURRENCY; w++)); do
  send_traffic "$w" &
done

wait
echo ""
echo "✅ Load generation complete! $(($CONCURRENCY * $ITERATIONS * 6)) total requests generated."
echo ""
echo ">>> View live metrics in Grafana:"
echo "    URL: http://192.168.1.242/d/belleshop-golden-signals/belleshop-4-golden-signals-dashboard"
echo "    User: admin | Password: prom-operator"
