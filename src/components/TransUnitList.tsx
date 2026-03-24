import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useXliff } from '../hooks/useXliff';
import { TransUnitCard } from './TransUnitCard';
import { getAllTransUnits } from '../services/xliffParser';

type FilterType = 'all' | 'translated' | 'untranslated';

export function TransUnitList() {
  const { state, getTranslation } = useXliff();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const allUnits = useMemo(() => {
    if (!state.document) return [];
    return getAllTransUnits(state.document);
  }, [state.document]);

  const filteredUnits = useMemo(() => {
    return allUnits.filter(unit => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const sourceText = unit.sourceHtml.toLowerCase();
        const translationText = (getTranslation(unit.id) || '').toLowerCase();
        if (!sourceText.includes(query) && !translationText.includes(query)) {
          return false;
        }
      }

      // Apply status filter
      const hasTranslation = !!getTranslation(unit.id);
      if (filter === 'translated' && !hasTranslation) return false;
      if (filter === 'untranslated' && hasTranslation) return false;

      return true;
    });
  }, [allUnits, searchQuery, filter, getTranslation]);

  const navigateToUnit = useCallback((index: number) => {
    if (index >= 0 && index < filteredUnits.length) {
      setFocusedIndex(index);
    }
  }, [filteredUnits.length]);

  // Scroll focused card into view
  useEffect(() => {
    if (focusedIndex !== null) {
      const card = cardRefs.current.get(focusedIndex);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the textarea within the card
        const textarea = card.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    }
  }, [focusedIndex]);

  const setCardRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(index, el);
    } else {
      cardRefs.current.delete(index);
    }
  }, []);

  if (!state.document) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search source or translations..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({allUnits.length})
            </button>
            <button
              onClick={() => setFilter('untranslated')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filter === 'untranslated'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Untranslated ({allUnits.filter(u => !getTranslation(u.id)).length})
            </button>
            <button
              onClick={() => setFilter('translated')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filter === 'translated'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Translated ({allUnits.filter(u => !!getTranslation(u.id)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {filteredUnits.length} of {allUnits.length} translation units
      </p>

      {/* Translation Units */}
      <div className="space-y-4">
        {filteredUnits.map((unit, index) => (
          <TransUnitCard
            key={unit.id}
            ref={setCardRef(index)}
            unit={unit}
            index={allUnits.indexOf(unit)}
            onNavigateNext={() => navigateToUnit(index + 1)}
            onNavigatePrev={() => navigateToUnit(index - 1)}
          />
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No translation units match your criteria.</p>
        </div>
      )}
    </div>
  );
}
