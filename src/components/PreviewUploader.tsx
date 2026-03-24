import { useCallback, useRef, ChangeEvent } from 'react';
import { usePreview } from '../hooks/usePreview';

export function PreviewUploader() {
  const { loadPreview, previewData, isLoading, error, clearPreview } = usePreview();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadPreview(files[0]);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [loadPreview]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  if (previewData) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-700">
            Preview loaded: {previewData.course.title}
          </span>
        </div>
        <button
          onClick={clearPreview}
          className="text-xs text-green-600 hover:text-green-800 underline"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3
          border-2 border-dashed rounded-lg transition-colors
          ${isLoading
            ? 'border-gray-200 bg-gray-50 cursor-wait'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            <span className="text-sm text-gray-500">Loading preview...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm text-gray-600">
              Load HTML Export Preview
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".js"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-400 text-center">
        Select the <code className="bg-gray-100 px-1 rounded">runtime-data.js</code> file from your HTML export
      </p>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
