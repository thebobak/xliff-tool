import { useEffect, useRef } from 'react';
import { usePreview } from '../hooks/usePreview';
import { useXliff } from '../hooks/useXliff';
import { PreviewLesson } from './PreviewLesson';
import { PreviewUploader } from './PreviewUploader';

export function PreviewPanel() {
  const { previewData } = usePreview();
  const { state } = useXliff();
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to active item when it changes
  useEffect(() => {
    const activeId = state.activeTransUnitId;
    if (!activeId || !containerRef.current) return;

    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      // Escape special characters for CSS selector
      const escapedId = CSS.escape(activeId);
      const activeElement = containerRef.current.querySelector(
        `[data-trans-unit-id="${escapedId}"]`
      );

      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    });
  }, [state.activeTransUnitId]);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Course Preview</h2>
        <PreviewUploader />
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {previewData ? (
          <div className="space-y-4">
            {/* Course Title */}
            <div className="pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {previewData.course.title}
              </h3>
              <p className="text-sm text-gray-500">
                {previewData.course.lessons.length} lessons
              </p>
            </div>

            {/* Lessons */}
            {previewData.course.lessons.map((lesson) => (
              <PreviewLesson
                key={lesson.id}
                lesson={lesson}
                previewData={previewData}
                activeTransUnitId={state.activeTransUnitId}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm">Load a preview to see course content here</p>
              <p className="text-xs mt-1">The preview will sync with the translation panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
