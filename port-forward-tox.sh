#!/bin/bash

# Toxicity Service Port Forwarding Script
# Forwards the Kubernetes pod to localhost:8001

echo "🔄 Z-Grid Toxicity Service Port Forwarding"
echo "==========================================="
echo ""
echo "Pod: tox-service-ml-enabled-57b866bc65-89952"
echo "Port: localhost:8001 → pod:8001"
echo ""
echo "⚠️  Keep this terminal open while using the service"
echo "⚠️  Press Ctrl+C to stop port forwarding"
echo ""
echo "Starting port forward..."
echo ""

# Start port forwarding
kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8001:8001

# This will keep running until Ctrl+C is pressed
echo ""
echo "Port forwarding stopped."
