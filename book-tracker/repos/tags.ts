import {getDbConnection} from './db-setup';
import {Tag} from '@/types/db';

export const TagRepository = {
  getAllTags: async (): Promise<Tag[]> => {
    const db = await getDbConnection();
    return await db.getAllAsync<Tag>('SELECT * FROM tags ORDER BY name ASC');
  },

  findOrCreateTag: async (tagName: string): Promise<number> => {
    const db = await getDbConnection();
    const cleanName = tagName.trim();

    const existingTag = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM tags WHERE name = ?',
      [cleanName]
    );

    if (existingTag) return existingTag.id;

    const result = await db.runAsync('INSERT INTO tags (name) VALUES (?)', [cleanName]);
    return result.lastInsertRowId;
  },

  linkTagToBook: async (bookId: number, tagId: number): Promise<void> => {
    const db = await getDbConnection();
    await db.runAsync(
      'INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)',
      [bookId, tagId]
    );
  },

  clearTagsForBook: async (bookId: number): Promise<void> => {
    const db = await getDbConnection();
    await db.runAsync('DELETE FROM book_tags WHERE book_id = ?', [bookId]);
  }
};