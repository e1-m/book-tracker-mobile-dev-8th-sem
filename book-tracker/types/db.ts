export type BookStatus = 'READING' | 'READ' | 'WANT_TO_READ' | 'DROPPED';

export interface Book {
  id?: number; // Optional because it doesn't exist until saved in DB
  title: string;
  author?: string | null;
  publish_year?: number | null;
  description?: string | null;
  cover_image_uri?: string | null;
  current_page?: number;
  total_pages: number;
  status?: BookStatus;
  created_at?: string;

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