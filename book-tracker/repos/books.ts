import {getDbConnection} from './db-setup';
import {Book, RawBookWithTags} from '@/types/db';

export const BookRepository = {
  getReadingBooks: async (): Promise<Book[]> => {
    const db = await getDbConnection();
    return await db.getAllAsync<Book>(
      `SELECT id, title, current_page, total_pages, cover_image_uri
       FROM books
       WHERE status = 'READING'
       ORDER BY created_at DESC`
    );
  },

  getAllBooks: async (searchQuery: string = ''): Promise<Book[]> => {
    const db = await getDbConnection();

    const query = `
        SELECT b.id,
               b.title,
               b.author,
               b.current_page,
               b.total_pages,
               b.status,
               b.cover_image_uri,
               GROUP_CONCAT(t.name) as tags
        FROM books b
                 LEFT JOIN book_tags bt ON b.id = bt.book_id
                 LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.title LIKE ?
           OR b.author LIKE ?
        GROUP BY b.id
        ORDER BY b.created_at DESC
    `;

    const searchTerm = `%${searchQuery}%`;
    const rawBooks = await db.getAllAsync<RawBookWithTags>(query, [searchTerm, searchTerm]);

    return rawBooks.map(book => ({
      ...book,
      tags: book.tags ? book.tags.split(',') : []
    }));
  },

  createBook: async (book: Book): Promise<number> => {
    const db = await getDbConnection();
    const result = await db.runAsync(
      `INSERT INTO books (title, author, publish_year, description, total_pages, status, cover_image_uri)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        book.title,
        book.author || null,
        book.publish_year || null,
        book.description || null,
        book.total_pages,
        book.status || 'WANT_TO_READ',
        book.cover_image_uri || null
      ]
    );
    return result.lastInsertRowId;
  },

  updateBook: async (id: number, book: Book): Promise<void> => {
    const db = await getDbConnection();
    await db.runAsync(
      `UPDATE books
       SET title           = ?,
           author          = ?,
           publish_year    = ?,
           description     = ?,
           current_page    = ?,
           total_pages     = ?,
           status          = ?,
           cover_image_uri = ?
       WHERE id = ?`,
      [
        book.title,
        book.author ?? null,
        book.publish_year ?? null,
        book.description ?? null,
        book.current_page ?? 0,
        book.total_pages,
        book.status ?? 'WANT_TO_READ',
        book.cover_image_uri ?? null,
        id
      ]
    );
  },

  updateProgress: async (id: number, currentPage: number): Promise<void> => {
    const db = await getDbConnection();
    await db.runAsync('UPDATE books SET current_page = ? WHERE id = ?', [currentPage, id]);
  },

  deleteBook: async (id: number): Promise<void> => {
    const db = await getDbConnection();
    await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
  }
};