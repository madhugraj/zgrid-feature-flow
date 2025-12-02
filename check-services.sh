#!/bin/bash

# Z-Grid Service Health Check Script
# This script tests all 8 backend services

echo "🔍 Z-Grid Service Health Check"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
        return 1
    fi
}

# Check all services
total=0
passed=0

echo "1. PII Detection Service"
check_service "PII" "http://57.152.84.241:8000/health" && ((passed++))
((total++))
echo ""

echo "2. Toxicity Detection Service (requires port forwarding)"
check_service "Toxicity" "http://localhost:8001/health" && ((passed++))
((total++))
echo ""

echo "3. Jailbreak Detection (RoBERTa)"
check_service "Jailbreak RoBERTa" "http://172.210.123.118:5005/health" && ((passed++))
((total++))
echo ""

echo "4. Jailbreak Detection (DistilBERT)"
check_service "Jailbreak DistilBERT" "http://4.156.246.0:8002/health" && ((passed++))
((total++))
echo ""

echo "5. Ban/Content Service"
check_service "Ban/Content" "http://48.194.33.158:8004/health" && ((passed++))
((total++))
echo ""

echo "6. Secrets Detection Service"
check_service "Secrets" "http://4.156.154.216:8005/health" && ((passed++))
((total++))
echo ""

echo "7. Format Validation Service"
check_service "Format" "http://20.242.132.57:8006/health" && ((passed++))
((total++))
echo ""

echo "8. Gibberish Detection Service"
check_service "Gibberish" "http://51.8.74.156:8007/health" && ((passed++))
((total++))
echo ""

# Summary
echo "================================"
echo "Summary: $passed/$total services are healthy"
echo ""

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✓ All services are operational!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some services are down. Check the logs above.${NC}"
    exit 1
fi
