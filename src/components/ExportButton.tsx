import { useCallback, useState } from 'react';
import { useXliff } from '../hooks/useXliff';
import { exportXliff } from '../services/xliffExporter';
import { downloadFile, generateExportFilename } from '../services/fileService';

export function ExportButton() {
  const { state, markSaved, getTranslatedCount, getTotalCount } = useXliff();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    if (!state.document) return;

    setIsExporting(true);
    setError(null);

    try {
      const xmlContent = exportXliff(state.document, state.translations);
      const filename = generateExportFilename(state.fileName);
      downloadFile(xmlContent, filename);
      markSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [state.document, state.translations, state.fileName, markSaved]);

  if (!state.document) {
    return null;
  }

  const translatedCount = getTranslatedCount();
  const totalCount = getTotalCount();
  const progress = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Translation Progress</h3>
          <p className="text-sm text-gray-500">
            {translatedCount} of {totalCount} units translated ({progress}%)
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || translatedCount === 0}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent rounded-md
            shadow-sm text-sm font-medium text-white transition-colors
            ${translatedCount === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : isExporting
                ? 'bg-blue-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }
          `}
        >
          {isExporting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export XLIFF
            </>
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {state.isDirty && (
        <p className="mt-2 text-xs text-amber-600">
          You have unsaved changes
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
