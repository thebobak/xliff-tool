import { useContext } from 'react';
import { PreviewContext } from '../context/PreviewContext';

export function usePreview() {
  const context = useContext(PreviewContext);

  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }

  return context;
}
