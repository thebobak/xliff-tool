export interface TransUnit {
  id: string;
  source: string;          // Raw XML string of <source> content
  sourceHtml: string;      // Rendered HTML for display
  target?: string;         // User's translation (raw XML)
  targetText?: string;     // Plain text version for editing
  fileId: string;          // Which <file> this belongs to
  fileName?: string;       // file/@original attribute for display
}

export interface XliffFile {
  original: string;        // file/@original attribute
  sourceLanguage: string;
  transUnits: TransUnit[];
}

export interface XliffDocument {
  version: string;
  files: XliffFile[];
  rawXml: string;          // Preserve original for structure
}

export interface XliffState {
  document: XliffDocument | null;
  translations: Map<string, string>; // transUnitId -> translation text
  isDirty: boolean;
  fileName: string | null;
  activeTransUnitId: string | null; // Currently focused trans-unit for preview sync
}

export type XliffAction =
  | { type: 'LOAD_DOCUMENT'; payload: { document: XliffDocument; fileName: string } }
  | { type: 'UPDATE_TRANSLATION'; payload: { transUnitId: string; text: string } }
  | { type: 'CLEAR_DOCUMENT' }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_ACTIVE_TRANS_UNIT'; payload: string | null };
