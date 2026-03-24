import { useContext } from 'react';
import { XliffContext } from '../context/XliffContext';

export function useXliff() {
  const context = useContext(XliffContext);

  if (!context) {
    throw new Error('useXliff must be used within an XliffProvider');
  }

  return context;
}
