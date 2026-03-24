/**
 * Parser for HTML export runtime-data.js files
 */

import { PreviewData, PreviewCourse, PreviewContentItem } from '../types/preview';

/**
 * Parse runtime-data.js content and extract course data
 */
export function parseRuntimeData(content: string): PreviewData {
  // Extract the base64 string from __jsonp("runtime-data.js","...")
  const match = content.match(/__jsonp\s*\(\s*["']runtime-data\.js["']\s*,\s*["']([^"']+)["']\s*\)/);

  if (!match) {
    throw new Error('Invalid runtime-data.js format: could not find __jsonp call');
  }

  const base64Data = match[1];

  // Decode base64
  let jsonString: string;
  try {
    jsonString = atob(base64Data);
  } catch {
    throw new Error('Failed to decode base64 data from runtime-data.js');
  }

  // Parse JSON
  let data: { course: RawCourse };
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Failed to parse JSON from runtime-data.js');
  }

  if (!data.course) {
    throw new Error('No course data found in runtime-data.js');
  }

  // Build the preview data structure
  const course = extractCourse(data.course);
  const contentMap = buildContentMap(course);

  return { course, contentMap };
}

interface RawCourse {
  title: string;
  id: string;
  lessons: RawLesson[];
}

interface RawLesson {
  id: string;
  title: string;
  type?: string;
  items?: RawItem[];
}

interface RawItem {
  id: string;
  type: string;
  family?: string;
  variant?: string;
  items?: RawSubItem[];
  settings?: Record<string, unknown>;
}

interface RawSubItem {
  id: string;
  heading?: string;
  paragraph?: string;
  title?: string;
  description?: string;
  caption?: string;
  label?: string;
  front?: { description?: string; title?: string };
  back?: { description?: string; title?: string };
  completeHint?: string;
  feedback?: string;
  answers?: { id: string; title?: string; correct?: boolean }[];
}

function extractCourse(raw: RawCourse): PreviewCourse {
  return {
    title: raw.title,
    id: raw.id,
    lessons: (raw.lessons || []).map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      items: (lesson.items || []).map(item => ({
        id: item.id,
        type: item.type,
        family: item.family,
        variant: item.variant,
        settings: item.settings,
        items: item.items?.map(sub => ({
          id: sub.id,
          heading: sub.heading,
          paragraph: sub.paragraph,
          title: sub.title,
          description: sub.description,
          caption: sub.caption,
          label: sub.label,
          front: sub.front,
          back: sub.back,
          completeHint: sub.completeHint,
          feedback: sub.feedback,
          answers: sub.answers,
        })),
      })),
    })),
  };
}

/**
 * Build a map from XLIFF-style paths to content items
 */
function buildContentMap(course: PreviewCourse): Map<string, PreviewContentItem> {
  const map = new Map<string, PreviewContentItem>();

  for (const lesson of course.lessons) {
    // Add lesson title
    map.set(`${lesson.id}::title`, {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      itemId: '',
      subItemId: '',
      field: 'title',
      content: lesson.title,
      path: 'title',
    });

    // Process items
    for (const item of lesson.items) {
      if (!item.items) continue;

      for (const subItem of item.items) {
        const basePath = `items|id:${item.id}|items|id:${subItem.id}`;

        // Process all content fields
        const contentFields: [string, string | undefined][] = [
          ['heading', subItem.heading],
          ['paragraph', subItem.paragraph],
          ['title', subItem.title],
          ['description', subItem.description],
          ['caption', subItem.caption],
          ['label', subItem.label],
          ['completeHint', subItem.completeHint],
          ['feedback', subItem.feedback],
        ];

        for (const [field, content] of contentFields) {
          if (content) {
            const path = `${basePath}|${field}`;
            const fullId = `${lesson.id}::${path}`;
            map.set(fullId, {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              itemId: item.id,
              subItemId: subItem.id,
              field,
              content,
              path,
            });
          }
        }

        // Handle nested objects like front/back (for flashcards)
        if (subItem.front) {
          for (const [subField, content] of Object.entries(subItem.front)) {
            if (content && typeof content === 'string') {
              const path = `${basePath}|front|${subField}`;
              const fullId = `${lesson.id}::${path}`;
              map.set(fullId, {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                itemId: item.id,
                subItemId: subItem.id,
                field: `front|${subField}`,
                content,
                path,
              });
            }
          }
        }

        if (subItem.back) {
          for (const [subField, content] of Object.entries(subItem.back)) {
            if (content && typeof content === 'string') {
              const path = `${basePath}|back|${subField}`;
              const fullId = `${lesson.id}::${path}`;
              map.set(fullId, {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                itemId: item.id,
                subItemId: subItem.id,
                field: `back|${subField}`,
                content,
                path,
              });
            }
          }
        }

        // Handle answers (for quizzes)
        if (subItem.answers) {
          for (const answer of subItem.answers) {
            if (answer.title) {
              const path = `${basePath}|answers|id:${answer.id}|title`;
              const fullId = `${lesson.id}::${path}`;
              map.set(fullId, {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                itemId: item.id,
                subItemId: subItem.id,
                field: `answers|id:${answer.id}|title`,
                content: answer.title,
                path,
              });
            }
          }
        }
      }
    }
  }

  return map;
}

/**
 * Find preview content for a given XLIFF trans-unit ID
 */
export function findPreviewContent(
  previewData: PreviewData,
  transUnitId: string
): PreviewContentItem | undefined {
  return previewData.contentMap.get(transUnitId);
}

/**
 * Get all content items for a specific lesson
 */
export function getLessonContent(
  previewData: PreviewData,
  lessonId: string
): PreviewContentItem[] {
  const items: PreviewContentItem[] = [];
  for (const [, item] of previewData.contentMap) {
    if (item.lessonId === lessonId) {
      items.push(item);
    }
  }
  return items;
}
