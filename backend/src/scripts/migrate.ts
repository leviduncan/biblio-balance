import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createDatabaseSchema = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_image TEXT,
  description TEXT,
  genre TEXT,
  page_count INTEGER NOT NULL,
  current_page INTEGER DEFAULT 0,
  progress_percentage NUMERIC,
  status TEXT DEFAULT 'want-to-read',
  rating INTEGER,
  is_favorite BOOLEAN DEFAULT FALSE,
  started_reading TIMESTAMP,
  finished_reading TIMESTAMP,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL,
  date_started DATE,
  date_finished DATE,
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reading_stats table
CREATE TABLE IF NOT EXISTS reading_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  books_read INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  average_rating NUMERIC,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reading_challenges table
CREATE TABLE IF NOT EXISTS reading_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  percentage NUMERIC,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_challenges_user_id ON reading_challenges(user_id);
`;

// Migration to add auth columns to existing profiles table
const addAuthColumns = `
DO $$
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
    END IF;

    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'password_hash') THEN
        ALTER TABLE profiles ADD COLUMN password_hash TEXT;
    END IF;
END $$;
`;

async function migrate() {
    console.log('🔍 Starting database migration...');
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL:', dbUrl?.replace(/:[^:]*@/, ':****@'));

    // First, try to connect to the specific database
    const client = new Client({
        connectionString: dbUrl,
        connectionTimeoutMillis: 30000,
    });

    try {
        console.log('⏳ Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        console.log('⏳ Creating tables...');
        await client.query(createDatabaseSchema);

        console.log('⏳ Adding auth columns if needed...');
        await client.query(addAuthColumns);
        console.log('✅ Database migration completed successfully!');

    } catch (error: any) {
        console.error('❌ Migration failed!');
        console.error('Error message:', error.message);

        if (error.message.includes('does not exist')) {
            console.error('\n📝 The database "bt-backend" does not exist.');
            console.error('You need to create it manually. Here are your options:\n');
            console.error('Option 1: Using psql (if installed):');
            console.error('  createdb -h 5.161.252.91 -p 5050 -U postgres -W bt-backend\n');
            console.error('Option 2: Using SQL:');
            console.error('  psql -h 5.161.252.91 -p 5050 -U postgres -c "CREATE DATABASE bt-backend;"\n');
        } else if (error.message.includes('password authentication failed')) {
            console.error('\n🔐 Authentication failed. Check your credentials:');
            console.error('  User: postgres');
            console.error('  Password: (check if correct)');
            console.error('  Host: 5.161.252.91');
            console.error('  Port: 5050\n');
        }

        throw error;
    } finally {
        await client.end();
    }
}

migrate();
