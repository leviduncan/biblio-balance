import { OpenLibraryBook } from '@/types/book';

const GENRES = [
  'fiction',
  'fantasy',
  'science fiction',
  'mystery',
  'thriller',
  'romance',
  'historical fiction',
  'biography',
  'non-fiction',
  'poetry',
  'horror',
  'adventure',
];

export const openLibraryService = {
  async searchBooks(query: string, limit: number = 50): Promise<OpenLibraryBook[]> {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      const data = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching from Open Library:', error);
      return [];
    }
  },

  async getBooksByGenre(genre: string, limit: number = 50): Promise<OpenLibraryBook[]> {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?subject=${encodeURIComponent(genre)}&limit=${limit}`
      );
      const data = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching by genre:', error);
      return [];
    }
  },

  async getPopularBooks(): Promise<OpenLibraryBook[]> {
    const allBooks: OpenLibraryBook[] = [];
    
    // Fetch popular books from multiple genres
    for (const genre of GENRES.slice(0, 6)) {
      const books = await this.getBooksByGenre(genre, 10);
      allBooks.push(...books);
    }

    return allBooks.slice(0, 50);
  },

  getCoverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | undefined {
    if (!coverId) return undefined;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  },

  getGenres(): string[] {
    return GENRES;
  },
};
