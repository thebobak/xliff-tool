import { useState, useCallback } from 'react';
import { useXliff } from '../hooks/useXliff';
import {
  translateBatch,
  isTranslationConfigured,
  LANGUAGE_OPTIONS,
} from '../services/translationService';
import { getAllTransUnits } from '../services/xliffParser';
import { xliffToPlainText } from '../services/contentRenderer';

export function TranslationControls() {
  const { state, updateTranslation, getTranslation } = useXliff();
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [translateUntranslatedOnly, setTranslateUntranslatedOnly] = useState(true);

  const isConfigured = isTranslationConfigured();

  const handleTranslate = useCallback(async () => {
    if (!state.document) return;

    setIsTranslating(true);
    setError(null);

    const allUnits = getAllTransUnits(state.document);

    // Filter to untranslated items if option is selected
    const unitsToTranslate = translateUntranslatedOnly
      ? allUnits.filter(unit => !getTranslation(unit.id))
      : allUnits;

    if (unitsToTranslate.length === 0) {
      setError('No items to translate');
      setIsTranslating(false);
      return;
    }

    // Prepare items for batch translation
    const items = unitsToTranslate.map(unit => ({
      id: unit.id,
      text: xliffToPlainText(unit.source),
    }));

    const languageName = LANGUAGE_OPTIONS.find(l => l.code === targetLanguage)?.name || targetLanguage;

    try {
      const results = await translateBatch(
        items,
        languageName,
        (completed, total) => {
          setProgress({ completed, total });
        }
      );

      // Apply successful translations
      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, id) => {
        if (result.success && result.translation) {
          updateTranslation(id, result.translation);
          successCount++;
        } else {
          errorCount++;
        }
      });

      if (errorCount > 0) {
        setError(`Completed with ${errorCount} error(s). ${successCount} items translated.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
      setProgress({ completed: 0, total: 0 });
    }
  }, [state.document, targetLanguage, translateUntranslatedOnly, getTranslation, updateTranslation]);

  if (!state.document) {
    return null;
  }

  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">AI Translation not configured</p>
            <p className="text-xs text-yellow-700 mt-1">
              Copy <code className="bg-yellow-100 px-1 rounded">.env.example</code> to <code className="bg-yellow-100 px-1 rounded">.env</code> and add your API credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allUnits = getAllTransUnits(state.document);
  const untranslatedCount = allUnits.filter(unit => !getTranslation(unit.id)).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">AI Translation</h3>

      <div className="space-y-3">
        {/* Language Selector */}
        <div>
          <label htmlFor="target-language" className="block text-xs text-gray-500 mb-1">
            Target Language
          </label>
          <select
            id="target-language"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={isTranslating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {LANGUAGE_OPTIONS.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="untranslated-only"
            checked={translateUntranslatedOnly}
            onChange={(e) => setTranslateUntranslatedOnly(e.target.checked)}
            disabled={isTranslating}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="untranslated-only" className="text-sm text-gray-600">
            Only translate untranslated items ({untranslatedCount} remaining)
          </label>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={isTranslating || (translateUntranslatedOnly && untranslatedCount === 0)}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md
            text-sm font-medium transition-colors
            ${isTranslating
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }
            disabled:bg-gray-300 disabled:cursor-not-allowed
          `}
        >
          {isTranslating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Translating... ({progress.completed}/{progress.total})
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Translate {translateUntranslatedOnly ? `(${untranslatedCount} items)` : `All (${allUnits.length} items)`}
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isTranslating && progress.total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
