import { createContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { PreviewData } from '../types/preview';
import { parseRuntimeData } from '../services/previewParser';
import { readFile } from '../services/fileService';

interface PreviewContextValue {
  previewData: PreviewData | null;
  isLoading: boolean;
  error: string | null;
  loadPreview: (file: File) => Promise<void>;
  clearPreview: () => void;
}

export const PreviewContext = createContext<PreviewContextValue | null>(null);

interface PreviewProviderProps {
  children: ReactNode;
}

export function PreviewProvider({ children }: PreviewProviderProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await readFile(file);
      const data = parseRuntimeData(content);
      setPreviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview data');
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewData(null);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    previewData,
    isLoading,
    error,
    loadPreview,
    clearPreview,
  }), [previewData, isLoading, error, loadPreview, clearPreview]);

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
}
