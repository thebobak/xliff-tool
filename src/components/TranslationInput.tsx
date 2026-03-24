import { useCallback, useState, useEffect, useRef, KeyboardEvent, MouseEvent } from 'react';
import { useXliff } from '../hooks/useXliff';

interface TranslationInputProps {
  transUnitId: string;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
}

export function TranslationInput({
  transUnitId,
  onNavigateNext,
  onNavigatePrev,
}: TranslationInputProps) {
  const { getTranslation, updateTranslation, setActiveTransUnit } = useXliff();
  const [localValue, setLocalValue] = useState(() => getTranslation(transUnitId));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Only sync from context when transUnitId changes (not on every render)
  useEffect(() => {
    setLocalValue(getTranslation(transUnitId));
  }, [transUnitId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    updateTranslation(transUnitId, value);
  }, [transUnitId, updateTranslation]);

  // Stop click propagation to prevent card's onClick from firing
  const handleClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Set active on focus
  const handleFocus = useCallback(() => {
    setActiveTransUnit(transUnitId);
  }, [setActiveTransUnit, transUnitId]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab to navigate to next unit
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onNavigateNext?.();
    }
    // Shift+Tab to navigate to previous unit
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      onNavigatePrev?.();
    }
  }, [onNavigateNext, onNavigatePrev]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
    }
  }, [localValue]);

  return (
    <div className="mt-3">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        Translation
      </label>
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onFocus={handleFocus}
        placeholder="Enter translation..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   resize-none overflow-hidden"
        rows={3}
      />
      <p className="mt-1 text-xs text-gray-400">
        Press Tab to go to next, Shift+Tab for previous
      </p>
    </div>
  );
}
