import { forwardRef, useCallback } from 'react';
import { TransUnit } from '../types/xliff';
import { SourceContent } from './SourceContent';
import { TranslationInput } from './TranslationInput';
import { useXliff } from '../hooks/useXliff';

interface TransUnitCardProps {
  unit: TransUnit;
  index: number;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
}

export const TransUnitCard = forwardRef<HTMLDivElement, TransUnitCardProps>(
  function TransUnitCard({ unit, index, onNavigateNext, onNavigatePrev }, ref) {
    const { getTranslation, setActiveTransUnit, state } = useXliff();
    const hasTranslation = !!getTranslation(unit.id);
    const isActive = state.activeTransUnitId === unit.id;

    const handleFocus = useCallback(() => {
      setActiveTransUnit(unit.id);
    }, [setActiveTransUnit, unit.id]);

    return (
      <div
        ref={ref}
        onClick={handleFocus}
        className={`
          bg-white rounded-lg shadow-sm border p-4 transition-colors cursor-pointer
          ${isActive
            ? 'border-blue-500 ring-2 ring-blue-200'
            : hasTranslation
              ? 'border-green-200 bg-green-50/30'
              : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-400">
              #{index + 1}
            </span>
            {hasTranslation && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Translated
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 truncate max-w-xs" title={unit.id}>
            {unit.fileName}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Source
          </label>
          <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
            <SourceContent html={unit.sourceHtml} />
          </div>
        </div>

        <TranslationInput
          transUnitId={unit.id}
          onNavigateNext={onNavigateNext}
          onNavigatePrev={onNavigatePrev}
        />
      </div>
    );
  }
);
