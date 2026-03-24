import { useMemo } from 'react';
import { PreviewLesson as PreviewLessonType, PreviewData } from '../types/preview';
import { PreviewContent } from './PreviewContent';
import { getLessonContent } from '../services/previewParser';

interface PreviewLessonProps {
  lesson: PreviewLessonType;
  previewData: PreviewData;
  activeTransUnitId: string | null;
}

export function PreviewLesson({ lesson, previewData, activeTransUnitId }: PreviewLessonProps) {
  const contentItems = useMemo(() => {
    return getLessonContent(previewData, lesson.id);
  }, [previewData, lesson.id]);

  // Check if this lesson contains the active trans-unit
  const hasActiveItem = useMemo(() => {
    return contentItems.some(item => `${item.lessonId}::${item.path}` === activeTransUnitId);
  }, [contentItems, activeTransUnitId]);

  if (contentItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        border rounded-lg overflow-hidden transition-all
        ${hasActiveItem ? 'border-blue-300 shadow-md' : 'border-gray-200'}
      `}
    >
      {/* Lesson Header */}
      <div className={`
        px-4 py-2 border-b
        ${hasActiveItem ? 'bg-blue-100 border-blue-200' : 'bg-gray-50 border-gray-200'}
      `}>
        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
        <p className="text-xs text-gray-500">{contentItems.length} items</p>
      </div>

      {/* Lesson Content */}
      <div className="p-2 space-y-1">
        {contentItems.map((item) => {
          const fullId = `${item.lessonId}::${item.path}`;
          return (
            <PreviewContent
              key={fullId}
              item={item}
              isActive={fullId === activeTransUnitId}
            />
          );
        })}
      </div>
    </div>
  );
}
