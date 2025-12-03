# 🚀 Deployment Instructions

To enable backend services in the Lovable production environment, you must deploy the updated Supabase Edge Function.

## 1. Deploy Gateway Proxy Function

This function acts as a proxy to bypass CORS restrictions in the browser.

```bash
supabase functions deploy gateway-proxy --no-verify-jwt
```

**Note**: You need to be logged in to Supabase CLI (`supabase login`).

## 2. Verify Deployment

Check if the function is active:
```bash
curl -X POST https://bgczwmnqxmxusfwapqcn.supabase.co/functions/v1/gateway-proxy/health \
  -H "Content-Type: application/json"
```

## 3. Push Frontend Changes

Push the latest code to GitHub, which will trigger a deployment on Lovable (if configured).

```bash
git push origin main
```

## 4. Troubleshooting

If you still see CORS errors in Lovable:
1. Check the browser console logs.
2. Verify the `gateway-proxy` function logs in Supabase Dashboard.
3. Ensure the backend services are reachable from the Supabase Edge Function (they must have public IPs).
