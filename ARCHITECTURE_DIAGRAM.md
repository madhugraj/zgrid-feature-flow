# Z-Grid Backend Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Z-Grid Feature Flow Frontend                     │
│                   (React + TypeScript + Vite)                        │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │  Feature Cards │  │  Feature Modal │  │  Admin Panel   │       │
│  │   (25 cards)   │  │  (Test & Try)  │  │  (AI Config)   │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│           │                   │                    │                │
│           └───────────────────┴────────────────────┘                │
│                               │                                     │
│                    ┌──────────▼──────────┐                         │
│                    │   zgridClient.ts    │                         │
│                    │  (API Functions)    │                         │
│                    └──────────┬──────────┘                         │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
        ┌───────────▼──────────┐  ┌────────▼─────────┐
        │  Direct Service Calls│  │  Gateway (8008)  │
        │   (8 services)       │  │  (Other services)│
        └───────────┬──────────┘  └──────────────────┘
                    │
        ┌───────────┴───────────────────────────────────────┐
        │                                                    │
┌───────▼────────┐  ┌────────────┐  ┌────────────┐  ┌─────▼──────┐
│ PII Detection  │  │ Jailbreak  │  │    Ban     │  │  Secrets   │
│ 57.152.84.241  │  │ 172.210... │  │ 48.194...  │  │ 4.156...   │
│    :8000       │  │   :5005    │  │   :8004    │  │   :8005    │
│   /detect      │  │  /detect   │  │   /check   │  │  /detect   │
│   ✗ DOWN       │  │  ✓ WORKING │  │ ✓ WORKING  │  │ ✓ WORKING  │
└────────────────┘  └────────────┘  └────────────┘  └────────────┘

┌────────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│   Toxicity     │  │ Jailbreak  │  │   Format   │  │ Gibberish  │
│   localhost    │  │ 4.156...   │  │ 20.242...  │  │ 51.8...    │
│     :8001      │  │   :8002    │  │   :8006    │  │   :8007    │
│   /detect      │  │  /detect   │  │ /validate  │  │  /detect   │
│ ⚠ PORT FWD REQ │  │ ✓ WORKING  │  │ ✓ WORKING  │  │ ✓ WORKING  │
└────────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## Request Flow Diagram

### Example: Testing PII Detection (ZG0001)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                   │
│    User enters text in Feature Modal (ZG0001 - PII Protection)  │
│    Input: "Contact john@example.com at 555-1234"                │
│    Clicks "Simulate" button                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND PROCESSING                                           │
│    FeatureModal.tsx → handleSimulate()                          │
│    Calls: validatePII(text, entities, return_spans)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. API CLIENT                                                    │
│    zgridClient.ts → validatePII()                               │
│    Endpoint: http://57.152.84.241:8000/detect                   │
│    Headers: { "X-API-Key": "supersecret123" }                   │
│    Body: {                                                       │
│      text: "Contact john@example.com at 555-1234",              │
│      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "PERSON"],     │
│      return_spans: true                                          │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. BACKEND SERVICE                                               │
│    PII Detection Service (FastAPI)                              │
│    - Runs Microsoft Presidio                                    │
│    - Runs GLiNER model                                          │
│    - Detects: EMAIL_ADDRESS, PHONE_NUMBER                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. RESPONSE                                                      │
│    {                                                             │
│      status: "fixed",                                            │
│      entities: [                                                 │
│        { type: "EMAIL_ADDRESS", value: "john@example.com" },    │
│        { type: "PHONE_NUMBER", value: "555-1234" }              │
│      ],                                                          │
│      redacted_text: "Contact [EMAIL] at [PHONE]"                │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND DISPLAY                                              │
│    ServiceResultsDisplay component shows:                       │
│    - Status: "Content Fixed"                                    │
│    - Detected Entities: 2                                       │
│    - Redacted Text: "Contact [EMAIL] at [PHONE]"                │
│    - Entity Details with badges                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Integration Matrix

| Service | IP:Port | Endpoint | Frontend Function | Status | Notes |
|---------|---------|----------|-------------------|--------|-------|
| **PII Detection** | 57.152.84.241:8000 | /detect | `validatePII()` | ❌ Down | Check service status |
| **Toxicity** | localhost:8001 | /detect | `validateTox()` | ⚠️ ClusterIP | Needs port forwarding |
| **Jailbreak (RoBERTa)** | 172.210.123.118:5005 | /detect | `validateJailbreak(text, true, false)` | ✅ Working | Default model |
| **Jailbreak (DistilBERT)** | 4.156.246.0:8002 | /detect | `validateJailbreak(text, true, true)` | ✅ Working | Alternative model |
| **Ban/Content** | 48.194.33.158:8004 | /check | `validateBan()` | ✅ Working | Uses /check not /detect |
| **Secrets** | 4.156.154.216:8005 | /detect | `validateSecrets()` | ✅ Working | - |
| **Format** | 20.242.132.57:8006 | /validate | `validateFormat()` | ✅ Working | Uses /validate not /detect |
| **Gibberish** | 51.8.74.156:8007 | /detect | `validateGibberish()` | ✅ Working | - |

---

## Data Flow: Feature Card to Backend

```
┌──────────────────────────────────────────────────────────────────┐
│                        FEATURE CARD                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ZG0001 - PII Protection                                   │  │
│  │  "Identifies and redacts PII..."                           │  │
│  │  [Click to Test]                                           │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ User clicks card
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FEATURE MODAL                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Description │  │ Test & Try  │  │  Configure  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                          │                                        │
│  ┌──────────────────────▼──────────────────────┐                │
│  │ [✓] Use FastAPI Services                    │                │
│  │                                              │                │
│  │ Test Input:                                  │                │
│  │ ┌──────────────────────────────────────────┐│                │
│  │ │ Contact john@example.com at 555-1234    ││                │
│  │ └──────────────────────────────────────────┘│                │
│  │                                              │                │
│  │ [Simulate Button]                            │                │
│  └──────────────────────────────────────────────┘                │
└────────────────────────────┬─────────────────────────────────────┘
                             │ User clicks Simulate
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    zgridClient.ts                                 │
│                                                                   │
│  validatePII(text, entities, return_spans) {                     │
│    const result = await xfetch(                                  │
│      `${SERVICE_ENDPOINTS.PII}/detect`,                          │
│      {                                                            │
│        method: "POST",                                            │
│        headers: { "X-API-Key": API_KEY },                        │
│        body: { text, entities, return_spans }                    │
│      }                                                            │
│    );                                                             │
│    return result;                                                 │
│  }                                                                │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP POST
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              PII Detection Service (FastAPI)                      │
│              http://57.152.84.241:8000/detect                     │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Presidio   │  │    GLiNER    │  │  Custom PII  │          │
│  │   Analyzer   │  │     Model    │  │   Patterns   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                  │                    │
│         └─────────────────┴──────────────────┘                    │
│                           │                                       │
│                    Detect & Redact                                │
└────────────────────────────┬─────────────────────────────────────┘
                             │ JSON Response
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  ServiceResultsDisplay                            │
│                                                                   │
│  Status: ✓ Content Fixed                                         │
│                                                                   │
│  Detected Entities (2):                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [EMAIL_ADDRESS] john@example.com (95% confidence)        │   │
│  │ [PHONE_NUMBER] 555-1234 (90% confidence)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Redacted Text:                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Contact [EMAIL] at [PHONE]                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Service Health Monitoring

```
┌─────────────────────────────────────────────────────────────┐
│              check-services.sh Script                        │
│                                                              │
│  Every 30 seconds (with watch command):                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ curl http://57.152.84.241:8000/health      → ❌ FAIL   │ │
│  │ curl http://localhost:8001/health          → ❌ FAIL   │ │
│  │ curl http://172.210.123.118:5005/health    → ✅ OK     │ │
│  │ curl http://4.156.246.0:8002/health        → ✅ OK     │ │
│  │ curl http://48.194.33.158:8004/health      → ✅ OK     │ │
│  │ curl http://4.156.154.216:8005/health      → ✅ OK     │ │
│  │ curl http://20.242.132.57:8006/health      → ✅ OK     │ │
│  │ curl http://51.8.74.156:8007/health        → ✅ OK     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Summary: 6/8 services healthy (75%)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
User Input → validatePII()
                │
                ├─ Try: xfetch(SERVICE_ENDPOINTS.PII/detect)
                │       │
                │       ├─ Success → Return result
                │       │
                │       └─ Error → Catch block
                │                   │
                │                   ├─ Log error details
                │                   ├─ Show user-friendly message
                │                   └─ Optionally fallback to mock mode
                │
                └─ Display in ServiceResultsDisplay
```

---

## Configuration Management

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Panel                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Service: PII Detection                                 │ │
│  │ Config Type: entities                                  │ │
│  │                                                         │ │
│  │ Sample Inputs:                                          │ │
│  │ ┌─────────────────────────────────────────────────────┐│ │
│  │ │ Patient has blood type A+                          ││ │
│  │ │ My blood group is O negative                       ││ │
│  │ └─────────────────────────────────────────────────────┘│ │
│  │                                                         │ │
│  │ [Generate with AI] ← Uses Gemini via Supabase Edge Fn │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Generated Config (JSON):                               │ │
│  │ {                                                       │ │
│  │   "custom_entities": [{                                │ │
│  │     "type": "BLOOD_GROUP",                             │ │
│  │     "pattern": "\\b(A|B|AB|O)[+-]\\b",                 │ │
│  │     "description": "Blood type detection"              │ │
│  │   }]                                                    │ │
│  │ }                                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Save to Supabase → service_configurations table       │ │
│  │ Apply to Service → POST to PII service admin endpoint │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │ TypeScript │  │   Vite     │            │
│  │   18.3.1   │  │   5.8.3    │  │   5.4.19   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Tailwind   │  │ shadcn-ui  │  │  Zustand   │            │
│  │   3.4.17   │  │  (Radix)   │  │   5.0.8    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  FastAPI   │  │   Python   │  │   Docker   │            │
│  │   (8 svcs) │  │    3.11+   │  │ Containers │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Presidio  │  │  Detoxify  │  │  RoBERTa   │            │
│  │   (PII)    │  │   (Tox)    │  │ (Jailbreak)│            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Supabase  │  │ PostgreSQL │  │    Auth    │            │
│  │   Cloud    │  │    RLS     │  │  Service   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

**Created**: December 2, 2025  
**Status**: 75% Operational (6/8 services)  
**Next**: Fix PII service and set up Toxicity port forwarding
