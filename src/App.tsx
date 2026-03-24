import { XliffProvider } from './context/XliffContext';
import { PreviewProvider } from './context/PreviewContext';
import { FileUploader } from './components/FileUploader';
import { FileInfo } from './components/FileInfo';
import { ExportButton } from './components/ExportButton';
import { TransUnitList } from './components/TransUnitList';
import { PreviewPanel } from './components/PreviewPanel';
import { useXliff } from './hooks/useXliff';

function AppContent() {
  const { state } = useXliff();

  // Show file uploader if no document loaded
  if (!state.document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              XLIFF Translation Tool
            </h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <FileUploader />
        </main>
      </div>
    );
  }

  // Split-panel layout when document is loaded
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              XLIFF Translation Tool
            </h1>
            <span className="text-sm text-gray-500">
              Side-by-side Translation & Preview
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Split Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Translation */}
        <div className="w-1/2 flex flex-col overflow-hidden border-r border-gray-200">
          {/* File Info & Export */}
          <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200 space-y-3">
            <FileInfo />
            <ExportButton />
          </div>

          {/* Translation List */}
          <div className="flex-1 overflow-y-auto p-4">
            <TransUnitList />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <XliffProvider>
      <PreviewProvider>
        <AppContent />
      </PreviewProvider>
    </XliffProvider>
  );
}

export default App;
