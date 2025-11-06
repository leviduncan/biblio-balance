import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/book';

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
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBookFromDb);
  },

  async getByStatus(userId: string, status: string): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBookFromDb);
  },

  async getFavorites(userId: string): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBookFromDb);
  },

  async getById(id: string): Promise<Book | null> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapBookFromDb(data) : null;
  },

  async create(book: Partial<Book>, userId: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: userId,
        title: book.title,
        author: book.author,
        cover_image: book.coverImage,
        description: book.description,
        genre: book.genre,
        page_count: book.pageCount,
        current_page: book.currentPage || 0,
        status: book.status || 'want-to-read',
        is_favorite: book.isFavorite || false,
        rating: book.rating,
      })
      .select()
      .single();

    if (error) throw error;
    return mapBookFromDb(data);
  },

  async update(id: string, updates: Partial<Book>): Promise<Book> {
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.author !== undefined) dbUpdates.author = updates.author;
    if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.genre !== undefined) dbUpdates.genre = updates.genre;
    if (updates.pageCount !== undefined) dbUpdates.page_count = updates.pageCount;
    if (updates.currentPage !== undefined) dbUpdates.current_page = updates.currentPage;
    if (updates.startedReading !== undefined) dbUpdates.started_reading = updates.startedReading;
    if (updates.finishedReading !== undefined) dbUpdates.finished_reading = updates.finishedReading;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;

    const { data, error } = await supabase
      .from('books')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBookFromDb(data);
  },

  async updateProgress(id: string, currentPage: number, pageCount: number): Promise<Book> {
    const updates: any = { current_page: currentPage };
    
    // Auto-set started reading date if not set
    const book = await this.getById(id);
    if (book && !book.startedReading && currentPage > 0) {
      updates.started_reading = new Date().toISOString();
    }

    // Auto-complete book when reaching last page
    if (currentPage >= pageCount && book?.status !== 'completed') {
      updates.status = 'completed';
      updates.finished_reading = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBookFromDb(data);
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapBookFromDb(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async checkIfBookExists(userId: string, title: string, author: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('books')
      .select('id')
      .eq('user_id', userId)
      .eq('title', title)
      .eq('author', author)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
