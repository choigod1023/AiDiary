export interface DiaryEntry {
  id: string | number;
  title: string;
  date: string;
  emotion: string;
  entry: string;
  aiFeedback?: string;
  visibility?: "private" | "shared";
  shareToken?: string;
  userId?: string;
  authorName?: string;
}
