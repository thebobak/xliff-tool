import { useMemo } from 'react';
import { PreviewContentItem } from '../types/preview';

interface PreviewContentProps {
  item: PreviewContentItem;
  isActive: boolean;
}

export function PreviewContent({ item, isActive }: PreviewContentProps) {
  // Determine styling based on field type
  const fieldStyle = useMemo(() => {
    switch (item.field) {
      case 'heading':
      case 'title':
        return 'font-semibold text-lg';
      case 'caption':
        return 'text-sm text-gray-500 italic';
      case 'completeHint':
        return 'text-sm text-gray-400';
      case 'feedback':
        return 'text-sm bg-blue-50 p-2 rounded';
      default:
        return '';
    }
  }, [item.field]);

  // Field type badge
  const fieldBadge = useMemo(() => {
    const badges: Record<string, { label: string; color: string }> = {
      heading: { label: 'Heading', color: 'bg-purple-100 text-purple-700' },
      paragraph: { label: 'Paragraph', color: 'bg-gray-100 text-gray-600' },
      title: { label: 'Title', color: 'bg-blue-100 text-blue-700' },
      description: { label: 'Description', color: 'bg-green-100 text-green-700' },
      caption: { label: 'Caption', color: 'bg-yellow-100 text-yellow-700' },
      label: { label: 'Label', color: 'bg-pink-100 text-pink-700' },
      feedback: { label: 'Feedback', color: 'bg-cyan-100 text-cyan-700' },
    };

    // Handle nested fields like front|description
    const baseField = item.field.split('|')[0];
    return badges[baseField] || { label: item.field, color: 'bg-gray-100 text-gray-600' };
  }, [item.field]);

  return (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-200
        ${isActive
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-transparent hover:bg-gray-50'
        }
      `}
      data-trans-unit-id={`${item.lessonId}::${item.path}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs px-1.5 py-0.5 rounded ${fieldBadge.color}`}>
          {fieldBadge.label}
        </span>
      </div>
      <div
        className={`prose prose-sm max-w-none ${fieldStyle}`}
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    </div>
  );
}
