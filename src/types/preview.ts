/**
 * Types for HTML export preview data
 */

export interface PreviewCourse {
  title: string;
  id: string;
  lessons: PreviewLesson[];
}

export interface PreviewLesson {
  id: string;
  title: string;
  type?: string;
  items: PreviewItem[];
}

export interface PreviewItem {
  id: string;
  type: string;
  family?: string;
  variant?: string;
  items?: PreviewSubItem[];
  settings?: Record<string, unknown>;
}

export interface PreviewSubItem {
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
  answers?: PreviewAnswer[];
}

export interface PreviewAnswer {
  id: string;
  title?: string;
  correct?: boolean;
}

export interface PreviewData {
  course: PreviewCourse;
  contentMap: Map<string, PreviewContentItem>;
}

export interface PreviewContentItem {
  lessonId: string;
  lessonTitle: string;
  itemId: string;
  subItemId: string;
  field: string;
  content: string;
  path: string; // The full XLIFF-style path
}
