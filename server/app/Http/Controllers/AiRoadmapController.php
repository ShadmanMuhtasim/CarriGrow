<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AiRoadmapController extends Controller
{
    public function __construct(private readonly GeminiService $gemini)
    {
    }

    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_role' => ['required', 'string', 'max:100'],
            'target_role' => ['required', 'string', 'max:100'],
            'current_skills' => ['nullable', 'array'],
            'current_skills.*' => ['string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $validated = $validator->validated();
            $roadmap = $this->gemini->generateRoadmap(
                (string) $validated['current_role'],
                (string) $validated['target_role'],
                (array) ($validated['current_skills'] ?? [])
            );

            return response()->json([
                'success' => true,
                'roadmap' => $roadmap,
            ]);
        } catch (\Throwable $exception) {
            Log::error('AI roadmap generation failed', [
                'error' => $exception->getMessage(),
                'current_role' => $request->input('current_role'),
                'target_role' => $request->input('target_role'),
                'user_id' => auth('api')->id(),
            ]);

            $errorText = strtolower($exception->getMessage());
            $isQuotaOrRateLimit = str_contains($errorText, 'quota')
                || str_contains($errorText, 'rate limit')
                || str_contains($errorText, 'resource_exhausted');

            if ($isQuotaOrRateLimit) {
                $message = 'AI service quota is exhausted right now. Please retry in a minute or verify Gemini API billing/quota settings.';
                if (config('app.debug')) {
                    $message .= ' ' . $exception->getMessage();
                }

                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], 429);
            }

            $message = 'Failed to generate roadmap. Please try again.';
            if (config('app.debug')) {
                $message .= ' ' . $exception->getMessage();
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 500);
        }
    }
}
