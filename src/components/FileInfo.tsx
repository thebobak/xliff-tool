import { useXliff } from '../hooks/useXliff';

export function FileInfo() {
  const { state, clearDocument, getTotalCount } = useXliff();

  if (!state.document) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {state.fileName}
          </h2>
          <p className="text-sm text-gray-500">
            XLIFF {state.document.version} - {state.document.files.length} file(s) - {getTotalCount()} translation units
          </p>
        </div>
        <button
          onClick={clearDocument}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Load different file
        </button>
      </div>
    </div>
  );
}
