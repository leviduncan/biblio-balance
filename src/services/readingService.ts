import { supabase } from '@/integrations/supabase/client';
import { ReadingStats, ReadingChallenge } from '@/types/book';

export const readingService = {
  async getStats(userId: string): Promise<ReadingStats | null> {
    const { data, error } = await supabase
      .from('reading_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      booksRead: data.books_read,
      totalPages: data.total_pages,
      readingTime: data.reading_time,
      currentStreak: data.current_streak,
      averageRating: data.average_rating,
      lastUpdated: data.last_updated,
    };
  },

  async getChallenge(userId: string): Promise<ReadingChallenge | null> {
    const currentYear = new Date().getFullYear();
    
    // Try to get current year's challenge
    const { data, error } = await supabase
      .from('reading_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('year', currentYear)
      .maybeSingle();

    // If no challenge exists for current year, create one
    if (!data && !error) {
      const { data: newChallenge, error: createError } = await supabase
        .from('reading_challenges')
        .insert({
          user_id: userId,
          name: `${currentYear} Reading Challenge`,
          target: 24,
          current: 0,
          year: currentYear,
        })
        .select()
        .single();
        
      if (createError) throw createError;
      
      return newChallenge ? {
        id: newChallenge.id,
        userId: newChallenge.user_id,
        name: newChallenge.name,
        target: newChallenge.target,
        current: newChallenge.current,
        percentage: newChallenge.percentage,
        year: newChallenge.year,
        createdAt: newChallenge.created_at,
        updatedAt: newChallenge.updated_at,
      } : null;
    }

    if (error) throw error;
    if (!data) return null;

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
  },

  async updateStats(userId: string): Promise<void> {
    // Get all completed books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('page_count, rating')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (booksError) throw booksError;

    const booksRead = books?.length || 0;
    const totalPages = books?.reduce((sum, book) => sum + (book.page_count || 0), 0) || 0;
    const ratingsSum = books?.filter(b => b.rating).reduce((sum, book) => sum + (book.rating || 0), 0) || 0;
    const ratingsCount = books?.filter(b => b.rating).length || 0;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    // Update stats
    const { error: updateError } = await supabase
      .from('reading_stats')
      .update({
        books_read: booksRead,
        total_pages: totalPages,
        average_rating: averageRating,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Update challenge current count
    const { error: challengeError } = await supabase
      .from('reading_challenges')
      .update({
        current: booksRead,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (challengeError) throw challengeError;
  },

  async calculateMonthlyStats(userId: string, year: number) {
    const { data: books, error } = await supabase
      .from('books')
      .select('finished_reading, page_count')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('finished_reading', 'is', null);

    if (error) throw error;

    const monthlyStats = Array(12).fill(0).map((_, i) => ({
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      books: 0,
      pages: 0,
    }));

    books?.forEach(book => {
      const finishedDate = new Date(book.finished_reading!);
      if (finishedDate.getFullYear() === year) {
        const month = finishedDate.getMonth();
        monthlyStats[month].books += 1;
        monthlyStats[month].pages += book.page_count || 0;
      }
    });

    return monthlyStats;
  },

  async getGenreDistribution(userId: string) {
    const { data: books, error } = await supabase
      .from('books')
      .select('genre')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('genre', 'is', null);

    if (error) throw error;

    const genreCounts: Record<string, number> = {};
    books?.forEach(book => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
      }
    });

    return Object.entries(genreCounts).map(([name, value]) => ({
      name,
      value,
    }));
  },
};
