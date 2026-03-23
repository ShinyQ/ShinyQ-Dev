# CalorIQ AI Nutrition Pipeline — Implementation Plan

## Context

CalorIQ currently uses a **mock nutrition generator** (`app/services/nutrition.py`) that returns random values. The goal is to replace it with **Azure OpenAI GPT-4o-mini** as the nutrition engine — supporting both text descriptions (including Bahasa Indonesia) and food photos. The existing DB schema already has all the necessary columns (`image_url`, `ai_extracted_text`, `ai_confidence`, `raw_api_response`), so no schema migration is needed.

---

## Architecture: Base64 JSON (not multipart)

- Frontend already reads photos as data URLs via `FileReader.readAsDataURL`
- Send `image_base64` as a JSON string field alongside `description` — no multipart needed
- Images are analyzed by AI then discarded (no R2/S3 persistence)
- 10MB frontend cap → ~13MB base64 JSON max

---

## Error Response Contract

The backend returns structured error responses so the frontend can show context-aware UX. All error states use this shape:

```typescript
// Backend returns this on non-2xx responses
interface ApiErrorResponse {
  error: string;          // machine-readable error code
  detail: string;         // human-readable message for toast
  fallback?: boolean;     // true if backend already fell back to mock data
  retry_after?: number;   // seconds until rate limit resets (for 429)
}
```

**Error codes** (returned in `error` field):

| Code | HTTP | Meaning |
|------|------|---------|
| `ai_unavailable` | 200 (with fallback data) | AI failed, mock data returned instead |
| `rate_limit_exceeded` | 429 | User exceeded 50 AI calls/day |
| `input_required` | 422 | Neither description nor image provided |
| `image_too_large` | 413 | Base64 payload exceeds 10MB |
| `service_error` | 500 | Unexpected server error |

---

## Detailed UX Flows

### Flow 1: Text Input — Happy Path
```
User types "nasi goreng dan es teh manis"
  → Button shows "Analyzing..." with spinner
  → Backend: AI translates, estimates nutrition (~2-3s)
  → Result card appears with green "Logged!" badge
  → Toast: "Food logged successfully!"
  → Source badge: "AI" (small pill on result card)
```

### Flow 2: Photo Input — Happy Path
```
User taps camera → selects/takes photo
  → Preview thumbnail shows with filename
  → User taps "Log Food"
  → Button shows "Analyzing photo..." with spinner
  → Backend: AI identifies food items from image (~3-5s)
  → Result card with all detected items + nutrition
  → Toast: "Food logged successfully!"
```

### Flow 3: Photo + Text (Mixed Input)
```
User uploads photo AND types "this is my lunch, about 1 plate"
  → AI uses both signals for better estimation
  → Same happy path UX
```

### Flow 4: AI Service Unavailable (Azure down/timeout)
```
User submits food
  → Button shows "Analyzing..." spinner
  → Backend: AI call fails after 2 retries (~8s total)
  → Backend falls back to mock nutrition, returns 200 with fallback flag
  → Result card appears with orange "Estimated" badge (not green "Logged!")
  → Toast: "Food logged with estimated values" (warning style)
  → Small info text below result: "AI was unavailable. Values are approximate."
  → Data IS saved to DB (with source="mock")
```

**Key UX principle**: Never block the user. Always save something.

### Flow 5: Rate Limit Exceeded (50 calls/day)
```
User submits food
  → Backend returns 429 with retry_after
  → Button stops spinning
  → Toast: "Daily AI limit reached. Using estimated values."
  → Frontend auto-falls back to client-side mock (generateMockFoodLog)
  → Result card with orange "Estimated" badge
  → Small text: "Resets at midnight. [n] uses remaining tomorrow."
  → Data saved with source="mock" via mock fallback
```

**UX for approaching limit** (optional enhancement):
- Backend returns `X-AI-Remaining: 5` header when < 10 calls left
- Frontend shows subtle counter: "5 AI analyses left today"

### Flow 6: Backend Completely Down
```
User submits food
  → api.logFood() throws (fetch error / 5xx)
  → Frontend catches, generates mock data client-side
  → Result card with gray "Offline" badge
  → Toast: "Food logged in demo mode" (info style)
  → Data NOT saved to DB (offline)
  → Recent foods section shows client-side mock data
```

### Flow 7: Invalid Input
```
User taps "Log Food" with no text and no photo
  → Button stays disabled (canSubmit = false), no request sent

User somehow submits empty:
  → Backend returns 422 (input_required)
  → Toast: "Please describe your food or upload a photo"
```

### Flow 8: Image Too Large
```
User selects 15MB photo
  → Frontend validation catches (> 10MB), shows:
  → Toast: "Image must be under 10MB"
  → Photo not attached, file input reset
  → (Never hits backend)
```

---

## Result Card Visual States

The result card after logging needs 3 visual modes:

### 1. AI Success (green)
```
┌─────────────────────────────────┐
│ ✓ Logged!        [AI]  425 cal │  ← green badge + "AI" pill
│─────────────────────────────────│
│ Nasi Goreng          320 cal   │
│ P 12g | C 45g | F 8g          │
│ Es Teh Manis         105 cal   │
│ P 0g | C 26g | F 0g           │
│─────────────────────────────────│
│ P 12g   C 71g   F 8g          │
└─────────────────────────────────┘
```

### 2. Fallback/Estimated (orange)
```
┌─────────────────────────────────┐
│ ~ Estimated           425 cal  │  ← orange badge, no "AI" pill
│─────────────────────────────────│
│ ... food items ...             │
│─────────────────────────────────│
│ ⓘ AI was unavailable.          │  ← subtle info line
│   Values are approximate.      │
└─────────────────────────────────┘
```

### 3. Offline/Demo (zinc/gray)
```
┌─────────────────────────────────┐
│ ○ Demo mode           425 cal  │  ← gray badge
│─────────────────────────────────│
│ ... food items ...             │
│─────────────────────────────────│
│ ⓘ Not saved. Connect to       │
│   log for real.                │
└─────────────────────────────────┘
```

**Implementation**: Add a `resultMode` state: `"ai" | "fallback" | "offline"` — controls badge color, icon, and info text.

---

## Loading States

### Analyzing Text (~2-3s)
```
Button: [spinner] "Analyzing..."
```

### Analyzing Photo (~3-5s)
```
Button: [spinner] "Analyzing photo..."
Photo preview: subtle shimmer/pulse overlay
```

### AI Retry (after first attempt fails, ~4s more)
```
Button: [spinner] "Still analyzing..."  ← text changes on retry
```

This is tracked by a `loadingPhase` state: `"analyzing" | "retrying" | null`

---

## Implementation Steps

### Step 1: Backend Dependencies & Config

**`requirements.txt`** — add:
```
openai>=1.14.0
```

**`app/core/config.py`** — add to `Settings`:
```python
AZURE_OPENAI_ENDPOINT: str = ""
AZURE_OPENAI_API_KEY: str = ""
AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o-mini"
AZURE_OPENAI_API_VERSION: str = "2024-12-01-preview"
AI_RATE_LIMIT_PER_DAY: int = 50
```

**`.env.example`** + **`.env`** — add Azure credentials

---

### Step 2: Create AI Nutrition Service

**New file: `app/services/ai_nutrition.py`**

```python
# Module structure:
_client: AsyncAzureOpenAI | None     # lazy singleton
_get_client() -> AsyncAzureOpenAI

SYSTEM_PROMPT: str                    # detailed nutrition expert prompt

async def analyze_food(
    description: str | None,
    image_base64: str | None,
) -> tuple[list[dict], dict, float]:
    # Returns: (nutrition_items, raw_response, confidence)
    # - nutrition_items: list of dicts matching food_entries schema
    # - raw_response: full API response for raw_api_response column
    # - confidence: 0.0-1.0 for ai_confidence column

async def _call_openai(messages: list) -> dict:
    # Actual API call with retry logic
    # Retry: 2 attempts, exponential backoff (1s, 2s)
    # Raises: AIServiceError on all retries exhausted

async def check_rate_limit(user_id: UUID) -> tuple[bool, int]:
    # Returns: (is_allowed, remaining_count)
    # Uses Redis: ai_ratelimit:{user_id}:{date}
```

**System prompt** highlights:
- Expert nutritionist role with USDA-style knowledge
- Translate any language (Bahasa Indonesia, etc.) to English food names
- Estimate portions from context ("1 plate" ≈ 250-300g, "1 bowl" ≈ 200-250g)
- Calibration examples: rice 130cal/100g, chicken breast 165cal/100g, egg 155cal/100g
- For images: identify all visible items, estimate portions from visual cues
- Output strict JSON: `{"items": [...], "confidence": 0.85}`
- Temperature: 0.3, max_tokens: 2048
- `response_format={"type": "json_object"}`
- Image detail: `"low"` (cost-efficient, sufficient for food ID)

**Retry & fallback cascade:**
```
1st attempt → Azure OpenAI call
  ↓ fail (timeout/5xx/parse error)
2nd attempt → retry with same prompt (after 1s)
  ↓ fail
3rd attempt → retry (after 2s)
  ↓ fail
Fallback → import get_nutrition_for_description from nutrition.py
  → return mock data with source="mock"
  → log error for monitoring
```

---

### Step 3: Update Pydantic Request Model

**`app/models/food.py`** — modify `FoodLogRequest`:
```python
class FoodLogRequest(BaseModel):
    description: Optional[str] = Field(None, max_length=1000)
    image_base64: Optional[str] = Field(None)
    meal_type: Optional[str] = Field(None, pattern=...)
    logged_at: Optional[str] = Field(None)

    @model_validator(mode="after")
    def require_input(self):
        if not self.description and not self.image_base64:
            raise ValueError("Either description or image_base64 is required")
        return self
```

---

### Step 4: Update Food Logging Endpoint

**`app/api/foods.py`** — modify `log_food()`:

```python
# 1. Rate limit check
allowed, remaining = await check_rate_limit(user_id)
if not allowed:
    raise HTTPException(429, detail="Daily AI limit reached",
                        headers={"Retry-After": "...", "X-AI-Remaining": "0"})

# 2. Determine input_type
input_type = "image_text" if both else "image" if image else "text"

# 3. Call AI with fallback
source = "azure_openai"
try:
    nutrition_items, raw_response, confidence = await analyze_food(
        description=body.description,
        image_base64=body.image_base64,
    )
except AIServiceError:
    # Fallback to mock
    nutrition_items = get_nutrition_for_description(body.description or "unknown food")
    raw_response = {"fallback": True, "reason": "ai_unavailable"}
    confidence = 0.0
    source = "mock"

# 4. Insert into DB (same transaction as before)
# - food_logs: populate input_type, ai_extracted_text, ai_confidence
# - food_entries: source="azure_openai" or "mock", raw_api_response=raw_response

# 5. Return response with metadata
return {
    ...normal_response,
    "source": source,      # "azure_openai" or "mock"
    "ai_confidence": confidence,
}
```

**Response headers** on success:
```
X-AI-Remaining: 42   # calls remaining today
```

---

### Step 5: Update Frontend Types

**`src/lib/types.ts`** — extend `FoodLogResponse`:
```typescript
interface FoodLogResponse {
    // ... existing fields ...
    source?: "azure_openai" | "mock";     // NEW
    ai_confidence?: number;                // NEW (0-1)
}
```

---

### Step 6: Frontend — Wire Photo + Error Handling

**`src/lib/api.ts`** — update `logFood`:
```typescript
async logFood(data: {
    description?: string;
    image_base64?: string;
    meal_type?: string;
    logged_at?: string;
}): Promise<FoodLogResponse>
```

Also update `request()` to parse structured errors:
```typescript
private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(...);
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "unknown" }));
        const apiError = new ApiError(
            error.detail || "Request failed",
            res.status,
            error.error,           // error code
            error.retry_after,
        );
        throw apiError;
    }
    return res.json();
}
```

**New `ApiError` class** in `src/lib/api.ts`:
```typescript
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string,
        public retryAfter?: number,
    ) { super(message); }
}
```

---

### Step 7: Frontend Log Page — Full Error-Aware UX

**`src/app/(authenticated)/log/page.tsx`** — new states:
```typescript
const [resultMode, setResultMode] = useState<"ai" | "fallback" | "offline" | null>(null);
const [loadingText, setLoadingText] = useState("Analyzing...");
const [aiRemaining, setAiRemaining] = useState<number | null>(null);
```

**Updated `handleSubmit`:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    setResultMode(null);
    setLoadingText(photoFile ? "Analyzing photo..." : "Analyzing...");

    try {
        let imageBase64: string | undefined;
        if (photoFile && photoPreview) {
            imageBase64 = photoPreview.split(",")[1];
        }

        const data = await api.logFood({
            description: description.trim() || undefined,
            image_base64: imageBase64,
            meal_type: mealType,
        });

        setResult(data);
        setDescription("");
        removePhoto();

        if (data.source === "mock") {
            // Backend fell back to mock (AI was down)
            setResultMode("fallback");
            toast("Food logged with estimated values", { icon: "⚠️" });
        } else {
            setResultMode("ai");
            toast.success("Food logged successfully!");
        }

        fetchRecentFoods();
    } catch (error) {
        if (error instanceof ApiError && error.code === "rate_limit_exceeded") {
            // Rate limited — use client-side mock
            const mockData = generateMockFoodLog(
                description.trim() || "food", mealType
            );
            setResult(mockData);
            setResultMode("fallback");
            setDescription("");
            removePhoto();
            toast("Daily AI limit reached. Using estimates.", { icon: "⏳" });
        } else {
            // Backend completely down — offline mode
            const mockData = generateMockFoodLog(
                description.trim() || "food", mealType
            );
            setResult(mockData);
            setResultMode("offline");
            setDescription("");
            removePhoto();
            toast.info("Food logged in demo mode");
        }
    } finally {
        setLoading(false);
    }
};
```

**Updated result card** — conditional rendering based on `resultMode`:
```tsx
{result && (
    <div className={cn("rounded-xl border p-4", {
        "border-orange-200 bg-orange-50/60": resultMode === "ai",
        "border-amber-200 bg-amber-50/60": resultMode === "fallback",
        "border-zinc-200 bg-zinc-50/60": resultMode === "offline",
    })}>
        {/* Header with badge */}
        <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {resultMode === "ai" && <Badge color="green">AI</Badge>}
                {resultMode === "fallback" && <Badge color="amber">Estimated</Badge>}
                {resultMode === "offline" && <Badge color="zinc">Demo</Badge>}
                <span>Logged!</span>
            </div>
            <span>{totalCal} cal</span>
        </div>

        {/* Food items */}
        ...

        {/* Info footer for non-AI results */}
        {resultMode === "fallback" && (
            <p className="text-[11px] text-amber-600">
                AI was unavailable. Values are approximate.
            </p>
        )}
        {resultMode === "offline" && (
            <p className="text-[11px] text-zinc-500">
                Not saved to your account. Connect to log for real.
            </p>
        )}
    </div>
)}
```

---

### Step 8: Frontend Proxy Route + Next.js Config

**`src/app/api/foods/log/route.ts`** — add timeout for AI processing:
```typescript
export const maxDuration = 30; // 30 seconds for AI calls
```

**`next.config.ts`** — increase body size limit for base64 images:
```typescript
const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: [],
    experimental: {
        serverBodyMaxSize: "15mb",
    },
};
```

---

## Files to Modify

| File | Change |
|------|--------|
| `backend/requirements.txt` | Add `openai>=1.14.0` |
| `backend/app/core/config.py` | Add 5 Azure OpenAI settings |
| `backend/.env.example` | Add env var templates |
| `backend/.env` | Add real Azure credentials |
| `backend/app/services/ai_nutrition.py` | **NEW** — AI nutrition engine with retry + rate limit |
| `backend/app/models/food.py` | `description` optional, add `image_base64`, add validator |
| `backend/app/api/foods.py` | Use AI service, rate limit, fallback, populate AI columns, return source/confidence |
| `frontend/src/lib/types.ts` | Add `source`, `ai_confidence` to `FoodLogResponse` |
| `frontend/src/lib/api.ts` | Add `ApiError` class, `image_base64` param, error parsing |
| `frontend/src/app/(authenticated)/log/page.tsx` | Full error-aware UX: `resultMode`, loading phases, conditional result card |
| `frontend/src/app/api/foods/log/route.ts` | Add `maxDuration = 30` |
| `frontend/next.config.ts` | Add `serverBodyMaxSize: "15mb"` |

## Files NOT Modified

| File | Reason |
|------|--------|
| `backend/app/services/nutrition.py` | Kept as fallback (imported by `ai_nutrition.py`) |
| `backend/app/db/models.py` | Schema already has all needed columns |
| `backend/app/services/cache.py` | Cache invalidation already works correctly |
| `frontend/src/lib/mock.ts` | Client-side mock stays for offline mode |
| `frontend/src/components/food/food-item.tsx` | No changes needed |

---

## Verification

1. **AI text test**: Log "nasi goreng dan es teh manis" → verify returns English names, realistic values, `source="azure_openai"`
2. **AI image test**: Upload food photo → verify detects items, `input_type="image"` in DB
3. **Fallback test**: Set invalid Azure key → verify mock fallback, orange "Estimated" badge, `source="mock"` in DB
4. **Rate limit test**: Exhaust 50 calls → verify 429 response, "Daily limit reached" toast, client-side mock used
5. **Offline test**: Stop backend → verify gray "Demo" badge, client-side mock, no DB save
6. **Build check**: `bun run build` (0 errors), `python3 -c "ast.parse(...)"` all files pass
7. **Visual check**: Preview all 3 result card states (AI/Fallback/Offline) on mobile viewport
