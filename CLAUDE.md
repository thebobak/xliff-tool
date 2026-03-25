# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

A React-based web application for translating XLIFF 1.2 files used in e-learning authoring tools. Users can load XLIFF files, view source content with a side-by-side course preview, use AI-powered translation, make manual edits, and export the translated file.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context + useReducer

## Project Structure

```
xliff-tool/
├── src/
│   ├── components/           # React UI components
│   │   ├── FileUploader.tsx      # Drag-drop file upload
│   │   ├── TransUnitList.tsx     # Filterable translation unit list
│   │   ├── TransUnitCard.tsx     # Individual translation unit
│   │   ├── TranslationInput.tsx  # Translation text input
│   │   ├── TranslationControls.tsx # AI translation UI
│   │   ├── PreviewPanel.tsx      # Course preview panel
│   │   ├── PreviewLesson.tsx     # Lesson preview
│   │   ├── PreviewContent.tsx    # Content item preview
│   │   ├── ExportButton.tsx      # Export with progress
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── xliffParser.ts        # Parse XLIFF XML → internal model
│   │   ├── xliffExporter.ts      # Internal model → XLIFF with targets
│   │   ├── contentRenderer.ts    # Convert <g ctype="x-html-*"> to HTML
│   │   ├── previewParser.ts      # Parse HTML export runtime-data.js
│   │   ├── translationService.ts # AI translation API integration
│   │   └── fileService.ts        # File I/O abstraction
│   ├── types/                # TypeScript interfaces
│   │   ├── xliff.ts              # TransUnit, XliffFile, XliffDocument
│   │   └── preview.ts            # Preview data types
│   ├── context/              # React Context providers
│   │   ├── XliffContext.tsx      # XLIFF document state
│   │   └── PreviewContext.tsx    # Preview data state
│   ├── hooks/                # Custom React hooks
│   │   ├── useXliff.ts
│   │   └── usePreview.ts
│   └── App.tsx               # Main app with split-panel layout
├── .env.example              # Environment variable template
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Common Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## XLIFF File Format

The app handles XLIFF 1.2 files with:
- Root `<xliff>` element with XML namespace declarations
- Multiple `<file>` elements (each representing a course section/lesson)
- `<trans-unit>` elements containing `<source>` text
- HTML content wrapped in `<g>` elements with `ctype` attributes (e.g., `x-html-P`, `x-html-STRONG`)

The `file/@original` attribute contains the lesson ID that maps to HTML export data.

## Preview Feature

The side-by-side preview loads `runtime-data.js` from HTML course exports:
- Base64-encoded JSON with full course structure
- Lesson IDs match XLIFF `file/@original` attributes
- Trans-unit paths match item ID hierarchies (e.g., `items|id:xxx|items|id:yyy|heading`)

**Important:** XLIFF and HTML export must be from the same course for preview sync to work.

## AI Translation

Configure in `.env` (copy from `.env.example`):
```
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=your-key
VITE_AI_MODEL=gpt-4o-mini
```

Supports any OpenAI-compatible API endpoint. The AI preserves HTML tags during translation.

## Key Implementation Details

- **Trans-unit IDs:** Composite format `{fileOriginal}::{transUnitId}` for uniqueness
- **Content rendering:** `<g ctype="x-html-P">` → `<p>`, etc.
- **State sync:** Translation inputs sync with context but avoid overwriting during active editing
- **CSS escaping:** Special characters in IDs are escaped for DOM queries
