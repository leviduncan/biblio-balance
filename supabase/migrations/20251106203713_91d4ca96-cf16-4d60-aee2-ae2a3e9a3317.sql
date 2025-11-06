-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create books table
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  cover_image text,
  description text,
  genre text,
  page_count integer NOT NULL,
  current_page integer DEFAULT 0,
  progress_percentage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN page_count > 0 THEN (current_page::numeric / page_count::numeric * 100)
      ELSE 0
    END
  ) STORED,
  started_reading timestamp with time zone,
  finished_reading timestamp with time zone,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  status text NOT NULL DEFAULT 'want-to-read' CHECK (status IN ('want-to-read', 'currently-reading', 'completed')),
  is_favorite boolean DEFAULT false,
  date_added timestamp with time zone DEFAULT now() NOT NULL,
  last_updated timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Users can view their own books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date_started date,
  date_finished date,
  is_public boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create reading_stats table
CREATE TABLE public.reading_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  books_read integer DEFAULT 0,
  total_pages integer DEFAULT 0,
  reading_time integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on reading_stats
ALTER TABLE public.reading_stats ENABLE ROW LEVEL SECURITY;

-- Reading stats policies
CREATE POLICY "Users can view their own stats"
  ON public.reading_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.reading_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.reading_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create reading_challenges table
CREATE TABLE public.reading_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target integer NOT NULL,
  current integer DEFAULT 0,
  percentage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN target > 0 THEN (current::numeric / target::numeric * 100)
      ELSE 0
    END
  ) STORED,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on reading_challenges
ALTER TABLE public.reading_challenges ENABLE ROW LEVEL SECURITY;

-- Reading challenges policies
CREATE POLICY "Users can view their own challenges"
  ON public.reading_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON public.reading_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON public.reading_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  
  -- Create reading stats
  INSERT INTO public.reading_stats (user_id)
  VALUES (new.id);
  
  -- Create reading challenge
  INSERT INTO public.reading_challenges (user_id, name, target)
  VALUES (new.id, '2024 Reading Challenge', 24);
  
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update book timestamps
CREATE OR REPLACE FUNCTION public.update_book_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

-- Trigger to update book timestamps
CREATE TRIGGER update_books_timestamp
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_book_timestamp();

-- Function to update challenge timestamp
CREATE OR REPLACE FUNCTION public.update_challenge_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to update challenge timestamps
CREATE TRIGGER update_challenges_timestamp
  BEFORE UPDATE ON public.reading_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_challenge_timestamp();