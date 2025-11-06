export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverImage?: string;
  description?: string;
  genre?: string;
  pageCount: number;
  currentPage: number;
  progressPercentage?: number;
  startedReading?: string;
  finishedReading?: string;
  rating?: number;
  status: 'want-to-read' | 'currently-reading' | 'completed';
  isFavorite: boolean;
  dateAdded: string;
  lastUpdated: string;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  content: string;
  rating: number;
  dateStarted?: string;
  dateFinished?: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface ReadingStats {
  id: string;
  userId: string;
  booksRead: number;
  totalPages: number;
  readingTime: number;
  currentStreak: number;
  averageRating: number;
  lastUpdated: string;
}

export interface ReadingChallenge {
  id: string;
  userId: string;
  name: string;
  target: number;
  current: number;
  percentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  number_of_pages_median?: number;
}
