import { Book } from '@/types/book';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Convert snake_case database response to camelCase frontend types
const mapBookFromDb = (dbBook: any): Book => ({
  id: dbBook.id,
  userId: dbBook.user_id,
  title: dbBook.title,
  author: dbBook.author,
  coverImage: dbBook.cover_image,
  description: dbBook.description,
  genre: dbBook.genre,
  pageCount: dbBook.page_count,
  currentPage: dbBook.current_page,
  progressPercentage: dbBook.progress_percentage,
  startedReading: dbBook.started_reading,
  finishedReading: dbBook.finished_reading,
  rating: dbBook.rating,
  status: dbBook.status,
  isFavorite: dbBook.is_favorite,
  dateAdded: dbBook.date_added,
  lastUpdated: dbBook.last_updated,
});

export const bookService = {
  async getAll(userId: string): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch books');
    const data = await response.json();
    return (data || []).map(mapBookFromDb);
  },

  async getByStatus(userId: string, status: string): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books/user/${userId}/status/${status}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch books');
    const data = await response.json();
    return (data || []).map(mapBookFromDb);
  },

  async getFavorites(userId: string): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/books/user/${userId}/favorites`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch favorites');
    const data = await response.json();
    return (data || []).map(mapBookFromDb);
  },

  async getById(id: string): Promise<Book | null> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return mapBookFromDb(data);
  },

  async create(book: Partial<Book>, userId: string): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        description: book.description,
        genre: book.genre,
        pageCount: book.pageCount,
        currentPage: book.currentPage || 0,
        status: book.status || 'want-to-read',
        isFavorite: book.isFavorite || false,
        rating: book.rating,
      }),
    });

    if (!response.ok) throw new Error('Failed to create book');
    const data = await response.json();
    return mapBookFromDb(data);
  },

  async update(id: string, updates: Partial<Book>): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error('Failed to update book');
    const data = await response.json();
    return mapBookFromDb(data);
  },

  async updateProgress(id: string, currentPage: number, pageCount: number): Promise<Book> {
    const updates: any = { currentPage };

    // Auto-set started reading date if not set
    const book = await this.getById(id);
    if (book && !book.startedReading && currentPage > 0) {
      updates.startedReading = new Date().toISOString();
    }

    // Auto-complete book when reaching last page
    if (currentPage >= pageCount && book?.status !== 'completed') {
      updates.status = 'completed';
      updates.finishedReading = new Date().toISOString();
    }

    return this.update(id, updates);
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Book> {
    return this.update(id, { isFavorite });
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to delete book');
  },

  async checkIfBookExists(userId: string, title: string, author: string): Promise<boolean> {
    const books = await this.getAll(userId);
    return books.some(b => b.title === title && b.author === author);
  },
};
