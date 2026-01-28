import { ReadingStats, ReadingChallenge } from '@/types/book';
import { bookService } from './bookService';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const readingService = {
  async getStats(userId: string): Promise<ReadingStats | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-stats/user/${userId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return null;

      const data = await response.json();
      return {
        id: data.id,
        userId: data.user_id,
        booksRead: data.books_read || 0,
        totalPages: data.total_pages || 0,
        readingTime: data.reading_time || 0,
        currentStreak: data.current_streak || 0,
        averageRating: parseFloat(data.average_rating) || 0,
        lastUpdated: data.last_updated,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  },

  async getChallenge(userId: string): Promise<ReadingChallenge | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-stats/challenges/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 404) {
        // Create a new challenge for this year
        const currentYear = new Date().getFullYear();
        return this.createChallenge(userId, `${currentYear} Reading Challenge`, 24, currentYear);
      }

      if (!response.ok) throw new Error('Failed to fetch challenge');

      const data = await response.json();
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        target: data.target,
        current: data.current,
        percentage: data.percentage,
        year: data.year,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }
  },

  async createChallenge(userId: string, name: string, target: number, year: number): Promise<ReadingChallenge | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reading-stats/challenges`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, name, target, year }),
      });

      if (!response.ok) throw new Error('Failed to create challenge');

      const data = await response.json();
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        target: data.target,
        current: data.current,
        percentage: data.percentage,
        year: data.year,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
  },

  async updateStats(userId: string): Promise<void> {
    try {
      // Get all completed books using bookService
      const allBooks = await bookService.getAll(userId);
      const books = allBooks.filter(b => b.status === 'completed');

      const booksRead = books.length;
      const totalPages = books.reduce((sum, book) => sum + (book.pageCount || 0), 0);
      const ratingsSum = books.filter(b => b.rating).reduce((sum, book) => sum + (book.rating || 0), 0);
      const ratingsCount = books.filter(b => b.rating).length;
      const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

      // Update stats
      await fetch(`${API_BASE_URL}/reading-stats/user/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          booksRead,
          totalPages,
          averageRating,
        }),
      });

      // Update challenge current count
      const response = await fetch(`${API_BASE_URL}/reading-stats/challenges/${userId}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const challenge = await response.json();
        const percentage = challenge.target > 0 ? (booksRead / challenge.target) * 100 : 0;

        await fetch(`${API_BASE_URL}/reading-stats/challenges/${challenge.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            current: booksRead,
            percentage: Math.min(100, percentage),
          }),
        }).catch(() => { });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  },

  async calculateMonthlyStats(userId: string, year: number) {
    try {
      const allBooks = await bookService.getAll(userId);
      const books = allBooks.filter(b => b.status === 'completed' && b.finishedReading);

      const monthlyStats = Array(12).fill(0).map((_, i) => ({
        month: new Date(year, i).toLocaleString('default', { month: 'short' }),
        books: 0,
        pages: 0,
      }));

      books.forEach(book => {
        const finishedDate = new Date(book.finishedReading!);
        if (finishedDate.getFullYear() === year) {
          const month = finishedDate.getMonth();
          monthlyStats[month].books += 1;
          monthlyStats[month].pages += book.pageCount || 0;
        }
      });

      return monthlyStats;
    } catch (error) {
      console.error('Error calculating monthly stats:', error);
      return Array(12).fill(0).map((_, i) => ({
        month: new Date(year, i).toLocaleString('default', { month: 'short' }),
        books: 0,
        pages: 0,
      }));
    }
  },

  async getGenreDistribution(userId: string) {
    try {
      const allBooks = await bookService.getAll(userId);
      const books = allBooks.filter(b => b.status === 'completed' && b.genre);

      const genreCounts: Record<string, number> = {};
      books.forEach(book => {
        if (book.genre) {
          genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
        }
      });

      return Object.entries(genreCounts).map(([name, value]) => ({
        name,
        value,
      }));
    } catch (error) {
      console.error('Error getting genre distribution:', error);
      return [];
    }
  },

  async updateChallengeTarget(userId: string, newTarget: number): Promise<void> {
    try {
      const challenge = await this.getChallenge(userId);
      if (!challenge) throw new Error('Challenge not found');

      await fetch(`${API_BASE_URL}/reading-stats/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ target: newTarget }),
      });
    } catch (error) {
      console.error('Error updating challenge target:', error);
    }
  },
};
