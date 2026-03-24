import { useCallback, useState, DragEvent, ChangeEvent } from 'react';
import { useXliff } from '../hooks/useXliff';
import { parseXliff } from '../services/xliffParser';
import { readFile } from '../services/fileService';

export function FileUploader() {
  const { loadDocument, state } = useXliff();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const content = await readFile(file);
      const document = parseXliff(content);
      loadDocument(document, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setIsLoading(false);
    }
  }, [loadDocument]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlf') || file.name.endsWith('.xliff')) {
        processFile(file);
      } else {
        setError('Please upload an XLIFF file (.xlf or .xliff)');
      }
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  if (state.document) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <p className="text-gray-600">Loading file...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
              >
                <span>Upload an XLIFF file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlf,.xliff"
                  onChange={handleFileInput}
                />
              </label>
              <p className="text-gray-500 mt-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              .xlf or .xliff files only
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
