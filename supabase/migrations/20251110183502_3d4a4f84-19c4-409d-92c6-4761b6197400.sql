-- Add year column to reading_challenges table
ALTER TABLE reading_challenges 
ADD COLUMN year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER;

-- Update existing records to 2024
UPDATE reading_challenges 
SET year = 2024 
WHERE year IS NULL;

-- Make year not null
ALTER TABLE reading_challenges 
ALTER COLUMN year SET NOT NULL;

-- Update the trigger function to use current year
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  -- Create reading challenge with current year
  INSERT INTO public.reading_challenges (user_id, name, target, year)
  VALUES (
    new.id, 
    EXTRACT(YEAR FROM NOW())::INTEGER || ' Reading Challenge',
    24,
    EXTRACT(YEAR FROM NOW())::INTEGER
  );
  
  RETURN new;
END;
$$;