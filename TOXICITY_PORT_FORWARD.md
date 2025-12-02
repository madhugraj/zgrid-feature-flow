# Toxicity Service Port Forwarding Guide

## Service Information

**Pod Name**: `tox-service-ml-enabled-57b866bc65-89952`  
**Status**: Running (1/1)  
**Internal IP**: `10.244.2.95`  
**Node**: `aks-agentpool-26109329-vmss000003`  
**Age**: 6d5h  
**Service Type**: ClusterIP (no external IP)

---

## Quick Setup

### Option 1: Port Forward to Pod (Recommended)
```bash
# Forward port 8001 from the pod to your local machine
kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8001:8001

# Keep this terminal open while testing
# The service will be available at http://localhost:8001
```

### Option 2: Port Forward to Service
```bash
# If you have a service named 'tox-service' or similar
kubectl port-forward svc/tox-service 8001:8001

# Or find the service name first
kubectl get svc | grep tox
```

### Option 3: Expose Service with LoadBalancer (Production)
```bash
# Create a LoadBalancer service to get an external IP
kubectl expose deployment tox-service-ml-enabled --type=LoadBalancer --port=8001 --target-port=8001 --name=tox-service-external

# Wait for external IP
kubectl get svc tox-service-external --watch
```

---

## Testing After Port Forward

### 1. Start Port Forwarding
```bash
kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8001:8001
```

You should see:
```
Forwarding from 127.0.0.1:8001 -> 8001
Forwarding from [::1]:8001 -> 8001
```

### 2. Test Health Endpoint
In a new terminal:
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{"status": "ok", "service": "toxicity-detection"}
```

### 3. Test Detection Endpoint
```bash
curl -X POST http://localhost:8001/detect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: supersecret123" \
  -d '{
    "text": "You are a stupid idiot!",
    "return_spans": true
  }'
```

Expected response:
```json
{
  "status": "fixed",
  "clean_text": "You are a [REMOVED] [REMOVED]!",
  "flagged": [
    {
      "type": "toxicity",
      "score": 0.95,
      "sentence": "You are a stupid idiot!"
    }
  ],
  "scores": {
    "toxicity": 0.95,
    "severe_toxicity": 0.12,
    "obscene": 0.45,
    "threat": 0.05,
    "insult": 0.89,
    "identity_attack": 0.03
  }
}
```

---

## Frontend Integration

Once port forwarding is active, the frontend will automatically work because it's already configured to use `http://localhost:8001`:

```typescript
// In src/lib/zgridClient.ts
const SERVICE_ENDPOINTS = {
  TOXICITY: "http://localhost:8001",  // ✅ Already configured!
  // ... other services
};
```

### Test from Frontend
1. Keep port forwarding running in terminal
2. Start dev server: `npm run dev`
3. Open ZG0004 (Toxicity & Profanity) feature card
4. Click "Test & Try" tab
5. Enable "Use FastAPI Services"
6. Enter toxic text and click "Simulate"

---

## Automated Port Forwarding

### Create a Background Script

Create `port-forward-tox.sh`:
```bash
#!/bin/bash

echo "🔄 Starting Toxicity Service Port Forwarding..."
echo "Pod: tox-service-ml-enabled-57b866bc65-89952"
echo "Port: 8001 → 8001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8001:8001
```

Make it executable:
```bash
chmod +x port-forward-tox.sh
```

Run it:
```bash
./port-forward-tox.sh
```

---

## Troubleshooting

### Port Already in Use
If port 8001 is already in use:
```bash
# Find what's using port 8001
lsof -i :8001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use a different local port
kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8002:8001
# Then update SERVICE_ENDPOINTS.TOXICITY to "http://localhost:8002"
```

### Pod Name Changed
If the pod restarts and gets a new name:
```bash
# Find the new pod name
kubectl get pods | grep tox-service

# Use the new pod name
kubectl port-forward pod/<new-pod-name> 8001:8001
```

### Connection Lost
If port forwarding disconnects:
```bash
# Just restart the port-forward command
kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8001:8001
```

---

## Production Solution: Expose with External IP

For production, instead of port forwarding, expose the service:

### Method 1: LoadBalancer Service
```bash
# Create LoadBalancer service
kubectl expose deployment tox-service-ml-enabled \
  --type=LoadBalancer \
  --port=8001 \
  --target-port=8001 \
  --name=tox-service-external

# Get the external IP (may take a few minutes)
kubectl get svc tox-service-external

# Once you have the external IP (e.g., 52.170.123.45)
# Update SERVICE_ENDPOINTS.TOXICITY to "http://52.170.123.45:8001"
```

### Method 2: NodePort Service
```bash
# Create NodePort service
kubectl expose deployment tox-service-ml-enabled \
  --type=NodePort \
  --port=8001 \
  --target-port=8001 \
  --name=tox-service-nodeport

# Get the NodePort
kubectl get svc tox-service-nodeport

# Access via: http://<node-ip>:<node-port>
```

### Method 3: Ingress
```yaml
# tox-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tox-service-ingress
spec:
  rules:
  - host: tox.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tox-service
            port:
              number: 8001
```

---

## Health Check Integration

Update the health check script to verify port forwarding:

```bash
# In check-services.sh, the Toxicity check will now work:
curl http://localhost:8001/health
```

---

## Summary

**Current Status**: Toxicity service is running in Kubernetes but only accessible via ClusterIP

**Quick Fix**: 
```bash
kubectl port-forward pod/tox-service-ml-enabled-57b866bc65-89952 8001:8001
```

**Long-term Solution**: Expose service with LoadBalancer to get external IP

**Frontend**: Already configured to use `http://localhost:8001` ✅

---

**Last Updated**: December 2, 2025  
**Pod**: tox-service-ml-enabled-57b866bc65-89952  
**Status**: Running and healthy
