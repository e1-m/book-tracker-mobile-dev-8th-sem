import {getDbConnection} from './db-setup';
import {Book} from '@/types/db';

export const BookRepository = {
  getReadingBooks: async (): Promise<Book[]> => {
    const db = await getDbConnection();
    return await db.getAllAsync<Book>(
      `SELECT 
         id, title, author, description, 
         current_page AS currentPage, 
         total_pages AS totalPages, 
         publish_year AS publishYear, 
         cover_image_uri AS coverImageUri, 
         status, created_at AS createdAt
       FROM books
       WHERE status = 'READING'
       ORDER BY created_at DESC`
    );
  },

  getBookById: async (id: number): Promise<Book | null> => {
    const db = await getDbConnection();
    const query = `
        SELECT 
           b.id, b.title, b.author, b.description,
           b.current_page AS currentPage,
           b.total_pages AS totalPages,
           b.publish_year AS publishYear,
           b.cover_image_uri AS coverImageUri,
           b.status, b.created_at AS createdAt,
           GROUP_CONCAT(t.name) as rawTags
        FROM books b
                 LEFT JOIN book_tags bt ON b.id = bt.book_id
                 LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.id = ?
        GROUP BY b.id
    `;
    const row = await db.getFirstAsync<any>(query, [id]);

    if (!row) return null;

    return {
      ...row,
      tags: row.rawTags ? row.rawTags.split(',') : []
    } as Book;
  },

  getAllBooks: async (searchQuery: string = ''): Promise<Book[]> => {
    const db = await getDbConnection();
    const query = `
        SELECT 
           b.id, b.title, b.author, b.description,
           b.current_page AS currentPage,
           b.total_pages AS totalPages,
           b.publish_year AS publishYear,
           b.cover_image_uri AS coverImageUri,
           b.status, b.created_at AS createdAt,
           GROUP_CONCAT(t.name) as rawTags
        FROM books b
                 LEFT JOIN book_tags bt ON b.id = bt.book_id
                 LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.title LIKE ? OR b.author LIKE ?
        GROUP BY b.id
        ORDER BY b.created_at DESC
    `;

    const searchTerm = `%${searchQuery}%`;
    const rows = await db.getAllAsync<any>(query, [searchTerm, searchTerm]);

    return rows.map(row => ({
      ...row,
      tags: row.rawTags ? row.rawTags.split(',') : []
    }));
  },

  createBook: async (book: Book): Promise<number> => {
    const db = await getDbConnection();

    // STRICT SANITIZATION: Force undefined to become null or defaults
    const title = book.title ?? 'Untitled';
    const author = book.author ?? null;
    const publishYear = typeof book.publishYear === 'number' && !isNaN(book.publishYear) ? book.publishYear : null;
    const description = book.description ?? null;
    const totalPages = typeof book.totalPages === 'number' && !isNaN(book.totalPages) ? book.totalPages : 1;
    const currentPage = typeof book.currentPage === 'number' && !isNaN(book.currentPage) ? book.currentPage : 0;
    const status = book.status ?? 'WANT_TO_READ';
    const coverImageUri = book.coverImageUri ?? null;

    const result = await db.runAsync(
      `INSERT INTO books (title, author, publish_year, description, total_pages, current_page, status, cover_image_uri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, publishYear, description, totalPages, currentPage, status, coverImageUri]
    );
    return result.lastInsertRowId;
  },

  updateBook: async (id: number, book: Book): Promise<void> => {
    const db = await getDbConnection();

    // STRICT SANITIZATION
    const title = book.title ?? 'Untitled';
    const author = book.author ?? null;
    const publishYear = typeof book.publishYear === 'number' && !isNaN(book.publishYear) ? book.publishYear : null;
    const description = book.description ?? null;
    const totalPages = typeof book.totalPages === 'number' && !isNaN(book.totalPages) ? book.totalPages : 1;
    const currentPage = typeof book.currentPage === 'number' && !isNaN(book.currentPage) ? book.currentPage : 0;
    const status = book.status ?? 'WANT_TO_READ';
    const coverImageUri = book.coverImageUri ?? null;
    const safeId = typeof id === 'number' && !isNaN(id) ? id : 0;

    await db.runAsync(
      `UPDATE books
       SET title = ?, author = ?, publish_year = ?, description = ?,
           current_page = ?, total_pages = ?, status = ?, cover_image_uri = ?
       WHERE id = ?`,
      [title, author, publishYear, description, currentPage, totalPages, status, coverImageUri, safeId]
    );
  },

  updateProgress: async (id: number, currentPage: number): Promise<void> => {
    const db = await getDbConnection();
    const safeCurrent = typeof currentPage === 'number' && !isNaN(currentPage) ? currentPage : 0;
    const safeId = typeof id === 'number' && !isNaN(id) ? id : 0;
    await db.runAsync('UPDATE books SET current_page = ? WHERE id = ?', [safeCurrent, safeId]);
  },

  deleteBook: async (id: number): Promise<void> => {
    const db = await getDbConnection();
    const safeId = typeof id === 'number' && !isNaN(id) ? id : 0;
    await db.runAsync('DELETE FROM books WHERE id = ?', [safeId]);
  }
};