/**
 * AI Translation Service
 * Calls an OpenAI-compatible API to translate text
 */

export interface TranslationConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export interface TranslationResult {
  success: boolean;
  translation?: string;
  error?: string;
}

/**
 * Get translation config from environment variables
 */
export function getTranslationConfig(): TranslationConfig | null {
  const apiUrl = import.meta.env.VITE_AI_API_URL;
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  const model = import.meta.env.VITE_AI_MODEL;

  if (!apiUrl || !apiKey) {
    return null;
  }

  return { apiUrl, apiKey, model: model || 'gpt-4o-mini' };
}

/**
 * Check if AI translation is configured
 */
export function isTranslationConfigured(): boolean {
  return getTranslationConfig() !== null;
}

/**
 * Translate a single text string to the target language
 */
export async function translateText(
  sourceText: string,
  targetLanguage: string,
  config?: TranslationConfig
): Promise<TranslationResult> {
  const cfg = config || getTranslationConfig();

  if (!cfg) {
    return {
      success: false,
      error: 'Translation API not configured. Please set VITE_AI_API_URL and VITE_AI_API_KEY in .env',
    };
  }

  // Skip empty or whitespace-only text
  if (!sourceText.trim()) {
    return { success: true, translation: '' };
  }

  const systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}.
Rules:
- Preserve all HTML tags exactly as they appear
- Preserve any formatting, line breaks, and structure
- Only translate the human-readable text content
- Do not add any explanations or notes
- Return ONLY the translated text`;

  try {
    const response = await fetch(cfg.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sourceText },
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      return {
        success: false,
        error: 'No translation returned from API',
      };
    }

    return { success: true, translation };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Translate multiple texts in batch with progress callback
 */
export async function translateBatch(
  items: Array<{ id: string; text: string }>,
  targetLanguage: string,
  onProgress?: (completed: number, total: number, currentId: string) => void,
  config?: TranslationConfig
): Promise<Map<string, TranslationResult>> {
  const results = new Map<string, TranslationResult>();
  const cfg = config || getTranslationConfig();

  if (!cfg) {
    const error = {
      success: false,
      error: 'Translation API not configured',
    };
    items.forEach(item => results.set(item.id, error));
    return results;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.(i, items.length, item.id);

    const result = await translateText(item.text, targetLanguage, cfg);
    results.set(item.id, result);

    // Small delay between requests to avoid rate limiting
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  onProgress?.(items.length, items.length, '');
  return results;
}

/**
 * Common language options for the selector
 */
export const LANGUAGE_OPTIONS = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
];
