step-by-step Gemini AI integration plan for CarriGrow.

---

## Step 1 — Get your Gemini API Key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with a Google account
3. Click **"Create API key"** → select a project (or create one)
4. Copy the key — it looks like `AIzaSy...`

The free tier gives you **15 requests/min, 1 million tokens/day** — more than enough for a career roadmap feature.

---

## Step 2 — Add the key to your `.env`

Open `server/.env` and add this line at the bottom:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Also add it to `server/.env.example` (without the real value):

```env
GEMINI_API_KEY=
```

---

## Step 3 — Create `GeminiService.php`

**Location:** `server/app/Services/GeminiService.php`

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    private string $apiKey;
    private string $endpoint;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    }

    public function generateRoadmap(string $currentRole, string $targetRole, array $currentSkills = []): string
    {
        $skillsList = count($currentSkills) > 0
            ? 'Current skills: ' . implode(', ', $currentSkills) . '.'
            : 'No prior skills specified.';

        $prompt = <<<EOT
You are a career advisor. A user wants to transition from "{$currentRole}" to "{$targetRole}".
{$skillsList}

Generate a clear, actionable learning roadmap with:
1. A short summary of the career transition (2-3 sentences)
2. 5-7 concrete steps they must take, each with:
   - Step title
   - What to learn/do
   - Recommended free resources (courses, docs, YouTube channels)
   - Estimated time to complete

Format your response clearly with numbered steps. Be specific and practical.
EOT;

        $response = Http::withoutVerifying()->post("{$this->endpoint}?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 2048,
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception('Gemini API request failed: ' . $response->body());
        }

        $data = $response->json();

        return $data['candidates'][0]['content']['parts'][0]['text']
            ?? throw new \Exception('Unexpected Gemini API response format.');
    }
}
```

---

## Step 4 — Register the key in `config/services.php`

Open `server/config/services.php` and add inside the return array:

```php
'gemini' => [
    'key' => env('GEMINI_API_KEY'),
],
```

---

## Step 5 — Create `AiRoadmapController.php`

**Location:** `server/app/Http/Controllers/AiRoadmapController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AiRoadmapController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_role'   => 'required|string|max:100',
            'target_role'    => 'required|string|max:100',
            'current_skills' => 'nullable|array',
            'current_skills.*' => 'string|max:50',
        ]);

        try {
            $roadmap = $this->gemini->generateRoadmap(
                $validated['current_role'],
                $validated['target_role'],
                $validated['current_skills'] ?? []
            );

            return response()->json([
                'success' => true,
                'roadmap' => $roadmap,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate roadmap. Please try again.',
            ], 500);
        }
    }
}
```

---

## Step 6 — Register the route in `api.php`

Open `server/routes/api.php`, add this import at the top with the other `use` statements:

```php
use App\Http\Controllers\AiRoadmapController;
```

Then inside the `auth:api` middleware group (after the existing routes), add:

```php
Route::post('/ai/roadmap', [AiRoadmapController::class, 'generate']);
```

---

## Step 7 — Create the frontend service

**Location:** `client/src/services/ai.ts`

```typescript
import { api } from './api';

export interface RoadmapRequest {
  current_role: string;
  target_role: string;
  current_skills?: string[];
}

export interface RoadmapResponse {
  success: boolean;
  roadmap: string;
  message?: string;
}

export async function generateAiRoadmap(data: RoadmapRequest): Promise<RoadmapResponse> {
  const response = await api.post<RoadmapResponse>('/ai/roadmap', data);
  return response.data;
}
```

---

## Step 8 — Create the AI Roadmap page

**Location:** `client/src/pages/jobseeker/AiRoadmap.tsx`

```tsx
import { useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { generateAiRoadmap } from '../../services/ai';
import { toastUI } from '../../components/ui/Toast';

export default function AiRoadmap() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill user's existing skills as a comma-joined string
  const userSkills = user?.skills?.map((s: any) => s.name) ?? [];

  async function handleGenerate() {
    if (!currentRole.trim() || !targetRole.trim()) {
      toastUI.error('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setRoadmap(null);

    try {
      const result = await generateAiRoadmap({
        current_role: currentRole,
        target_role: targetRole,
        current_skills: userSkills,
      });

      if (result.success) {
        setRoadmap(result.roadmap);
      } else {
        toastUI.error(result.message ?? 'Failed to generate roadmap.');
      }
    } catch {
      toastUI.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Career Roadmap' }]} />

      <h1 className="text-2xl font-semibold mt-4 mb-2">AI Career Roadmap</h1>
      <p className="text-gray-500 mb-6">
        Tell us where you are and where you want to go — our AI will build you a personalized learning path.
      </p>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your current role / background</label>
            <Input
              placeholder="e.g. Junior Web Developer, Marketing Executive"
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your target role</label>
            <Input
              placeholder="e.g. DevOps Engineer, Data Scientist"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            />
          </div>
          {userSkills.length > 0 && (
            <p className="text-xs text-gray-400">
              Your saved skills will be included automatically: {userSkills.join(', ')}
            </p>
          )}
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? 'Generating roadmap...' : '✨ Generate My Roadmap'}
          </Button>
        </div>
      </Card>

      {roadmap && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Personalized Roadmap</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {roadmap}
          </div>
        </Card>
      )}
    </div>
  );
}
```

---

## Step 9 — Register the route in `App.tsx`

In `client/src/App.tsx`, add the import:

```tsx
import AiRoadmap from './pages/jobseeker/AiRoadmap';
```

Then inside the protected `<Route path="/dashboard">` group, add:

```tsx
<Route path="ai-roadmap" element={<AiRoadmap />} />
```

---

## Step 10 — Add a nav link for jobseekers

Open `client/src/layouts/JobSeekerLayout.tsx` (or wherever jobseeker sidebar links are defined) and add a link to `/dashboard/ai-roadmap`. The exact JSX depends on how the sidebar is built, but it'll look something like:

```tsx
<NavLink to="/dashboard/ai-roadmap">✨ AI Career Roadmap</NavLink>
```

---

## Step 11 — Restart Docker

```bash
docker compose down && docker compose up --build
```

Or if only the server needs refreshing:

```bash
docker compose restart server
```

---



| Action | File path |
|--------|-----------|
| ✅ Create | `server/app/Services/GeminiService.php` |
| ✅ Create | `server/app/Http/Controllers/AiRoadmapController.php` |
| ✅ Edit | `server/routes/api.php` (add route + import) |
| ✅ Edit | `server/config/services.php` (add gemini key) |
| ✅ Edit | `server/.env` (add `GEMINI_API_KEY=`) |
| ✅ Create | `client/src/services/ai.ts` |
| ✅ Create | `client/src/pages/jobseeker/AiRoadmap.tsx` |
| ✅ Edit | `client/src/App.tsx` (add route) |
| ✅ Edit | `client/src/layouts/JobSeekerLayout.tsx` (add nav link) |

That's the full integration — no third-party packages needed on the Laravel side (it uses the built-in `Http` facade). The feature will be available at `/dashboard/ai-roadmap` once Docker restarts. Let me know if you hit any issues!