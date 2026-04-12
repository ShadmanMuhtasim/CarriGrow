<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    private string $baseEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function generateRoadmap(string $currentRole, string $targetRole, array $currentSkills = []): string
    {
        $apiKey = (string) config('services.gemini.key');
        if ($apiKey === '') {
            throw new Exception('GEMINI_API_KEY is not configured.');
        }
        $model = $this->resolveModel();
        $endpoint = "{$this->baseEndpoint}/{$model}:generateContent";

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

        $maxOutputTokens = max(1024, (int) env('GEMINI_MAX_OUTPUT_TOKENS', 4096));
        [$text, $finishReason] = $this->requestText(
            "{$endpoint}?key={$apiKey}",
            [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            $maxOutputTokens
        );

        // If model stopped due output token budget, request continuation once.
        if ($finishReason === 'MAX_TOKENS') {
            [$continuation] = $this->requestText(
                "{$endpoint}?key={$apiKey}",
                [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                    [
                        'role' => 'model',
                        'parts' => [
                            ['text' => $text],
                        ],
                    ],
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => 'Continue exactly where you stopped. Do not repeat previous content.'],
                        ],
                    ],
                ],
                $maxOutputTokens
            );

            $text = rtrim($text) . "\n\n" . ltrim($continuation);
        }

        return $text;
    }

    private function resolveModel(): string
    {
        return Cache::remember('gemini_resolved_model', 3600, function (): string {
            $fallbackModel = 'gemini-2.0-flash';
            $apiKey = (string) config('services.gemini.key');

            if ($apiKey === '') {
                return $fallbackModel;
            }

            try {
                $response = Http::timeout(20)
                    ->acceptJson()
                    ->get("{$this->baseEndpoint}?key={$apiKey}");

                if ($response->failed()) {
                    return $fallbackModel;
                }

                $models = data_get($response->json(), 'models');
                if (!is_array($models)) {
                    return $fallbackModel;
                }

                foreach ($models as $model) {
                    $name = data_get($model, 'name');
                    $methods = data_get($model, 'supportedGenerationMethods');

                    if (!is_string($name) || !is_array($methods)) {
                        continue;
                    }

                    $methodSupported = in_array('generateContent', $methods, true);
                    $lowerName = strtolower($name);
                    $isFlash = str_contains($lowerName, 'flash');
                    $isExcluded = str_contains($lowerName, 'vision')
                        || str_contains($lowerName, 'embedding')
                        || str_contains($lowerName, 'aqa');

                    if ($methodSupported && $isFlash && !$isExcluded) {
                        return str_starts_with($name, 'models/')
                            ? substr($name, 7)
                            : $name;
                    }
                }
            } catch (\Throwable $e) {
                return $fallbackModel;
            }

            return $fallbackModel;
        });
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function requestText(string $url, array $contents, int $maxOutputTokens): array
    {
        $response = Http::timeout(45)
            ->acceptJson()
            ->post($url, [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => $maxOutputTokens,
                ],
            ]);

        if ($response->failed()) {
            $errorMessage = data_get($response->json(), 'error.message');
            if (!is_string($errorMessage) || trim($errorMessage) === '') {
                $errorMessage = $response->body();
            }

            throw new Exception('Gemini API request failed: ' . $errorMessage);
        }

        $parts = data_get($response->json(), 'candidates.0.content.parts');
        if (!is_array($parts)) {
            throw new Exception('Unexpected Gemini API response format.');
        }

        $text = collect($parts)
            ->map(fn ($part) => is_array($part) && is_string(data_get($part, 'text')) ? (string) data_get($part, 'text') : '')
            ->implode('');

        if (trim($text) === '') {
            throw new Exception('Unexpected Gemini API response format.');
        }

        $finishReason = (string) data_get($response->json(), 'candidates.0.finishReason', '');

        return [$text, strtoupper($finishReason)];
    }
}
