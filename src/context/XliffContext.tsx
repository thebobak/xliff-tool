import { createContext, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { XliffDocument, XliffState, XliffAction } from '../types/xliff';

const initialState: XliffState = {
  document: null,
  translations: new Map(),
  isDirty: false,
  fileName: null,
  activeTransUnitId: null,
};

function xliffReducer(state: XliffState, action: XliffAction): XliffState {
  switch (action.type) {
    case 'LOAD_DOCUMENT': {
      // Initialize translations map with existing targets
      const translations = new Map<string, string>();
      action.payload.document.files.forEach(file => {
        file.transUnits.forEach(unit => {
          if (unit.targetText) {
            translations.set(unit.id, unit.targetText);
          }
        });
      });

      return {
        document: action.payload.document,
        translations,
        isDirty: false,
        fileName: action.payload.fileName,
        activeTransUnitId: null,
      };
    }

    case 'UPDATE_TRANSLATION': {
      const newTranslations = new Map(state.translations);
      if (action.payload.text.trim()) {
        newTranslations.set(action.payload.transUnitId, action.payload.text);
      } else {
        newTranslations.delete(action.payload.transUnitId);
      }

      return {
        ...state,
        translations: newTranslations,
        isDirty: true,
      };
    }

    case 'CLEAR_DOCUMENT':
      return initialState;

    case 'MARK_SAVED':
      return {
        ...state,
        isDirty: false,
      };

    case 'SET_ACTIVE_TRANS_UNIT':
      return {
        ...state,
        activeTransUnitId: action.payload,
      };

    default:
      return state;
  }
}

interface XliffContextValue {
  state: XliffState;
  loadDocument: (document: XliffDocument, fileName: string) => void;
  updateTranslation: (transUnitId: string, text: string) => void;
  clearDocument: () => void;
  markSaved: () => void;
  getTranslation: (transUnitId: string) => string;
  getTranslatedCount: () => number;
  getTotalCount: () => number;
  setActiveTransUnit: (id: string | null) => void;
}

export const XliffContext = createContext<XliffContextValue | null>(null);

interface XliffProviderProps {
  children: ReactNode;
}

export function XliffProvider({ children }: XliffProviderProps) {
  const [state, dispatch] = useReducer(xliffReducer, initialState);

  const loadDocument = useCallback((document: XliffDocument, fileName: string) => {
    dispatch({ type: 'LOAD_DOCUMENT', payload: { document, fileName } });
  }, []);

  const updateTranslation = useCallback((transUnitId: string, text: string) => {
    dispatch({ type: 'UPDATE_TRANSLATION', payload: { transUnitId, text } });
  }, []);

  const clearDocument = useCallback(() => {
    dispatch({ type: 'CLEAR_DOCUMENT' });
  }, []);

  const markSaved = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' });
  }, []);

  const setActiveTransUnit = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_TRANS_UNIT', payload: id });
  }, []);

  const getTranslation = useCallback((transUnitId: string): string => {
    return state.translations.get(transUnitId) || '';
  }, [state.translations]);

  const getTranslatedCount = useCallback((): number => {
    return state.translations.size;
  }, [state.translations]);

  const getTotalCount = useCallback((): number => {
    if (!state.document) return 0;
    return state.document.files.reduce((sum, file) => sum + file.transUnits.length, 0);
  }, [state.document]);

  const value = useMemo(() => ({
    state,
    loadDocument,
    updateTranslation,
    clearDocument,
    markSaved,
    getTranslation,
    getTranslatedCount,
    getTotalCount,
    setActiveTransUnit,
  }), [state, loadDocument, updateTranslation, clearDocument, markSaved, getTranslation, getTranslatedCount, getTotalCount, setActiveTransUnit]);

  return (
    <XliffContext.Provider value={value}>
      {children}
    </XliffContext.Provider>
  );
}
