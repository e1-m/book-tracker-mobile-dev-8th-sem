export type BookStatus = 'READING' | 'READ' | 'WANT_TO_READ' | 'DROPPED';

export interface Book {
  id: number;
  title: string;
  author: string | null;
  publishYear: number | null;
  description: string | null;
  coverImageUri: string | null;
  currentPage: number;
  totalPages: number;
  status: BookStatus;
  createdAt: string;

  // Optional field populated by our complex JOIN query
  tags?: string[];
}

export interface Tag {
  id: number;
  name: string;
}

// Type for the raw DB return before we split the tags string
export interface RawBookWithTags extends Omit<Book, 'tags'> {
  tags: string | null;
}