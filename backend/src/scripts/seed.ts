import { Client } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_USER = {
    email: 'demo@bibliobalance.com',
    password: 'demo123',
    username: 'BookLover',
};

const SAMPLE_BOOKS = [
    // Currently Reading
    {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas & Andrew Hunt',
        cover_image: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
        description: 'A guide to becoming a better programmer through practical advice and timeless principles.',
        genre: 'Technology',
        page_count: 352,
        current_page: 180,
        status: 'reading',
        is_favorite: true,
        rating: null,
    },
    {
        title: 'Atomic Habits',
        author: 'James Clear',
        cover_image: 'https://covers.openlibrary.org/b/id/10958382-L.jpg',
        description: 'An easy and proven way to build good habits and break bad ones.',
        genre: 'Self-Help',
        page_count: 320,
        current_page: 95,
        status: 'reading',
        is_favorite: false,
        rating: null,
    },
    // Completed
    {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        cover_image: 'https://covers.openlibrary.org/b/id/8503380-L.jpg',
        description: 'A handbook of agile software craftsmanship.',
        genre: 'Technology',
        page_count: 464,
        current_page: 464,
        status: 'completed',
        is_favorite: true,
        rating: 5,
    },
    {
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        cover_image: 'https://covers.openlibrary.org/b/id/8127984-L.jpg',
        description: 'A powerful primer on how and why some products satisfy customers.',
        genre: 'Design',
        page_count: 368,
        current_page: 368,
        status: 'completed',
        is_favorite: false,
        rating: 4,
    },
    {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        cover_image: 'https://covers.openlibrary.org/b/id/8256494-L.jpg',
        description: 'A groundbreaking tour of the mind and explains the two systems that drive the way we think.',
        genre: 'Psychology',
        page_count: 499,
        current_page: 499,
        status: 'completed',
        is_favorite: true,
        rating: 5,
    },
    {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        cover_image: 'https://covers.openlibrary.org/b/id/8406786-L.jpg',
        description: 'A narrative of humanity\'s creation and evolution.',
        genre: 'History',
        page_count: 443,
        current_page: 443,
        status: 'completed',
        is_favorite: false,
        rating: 4,
    },
    {
        title: 'Deep Work',
        author: 'Cal Newport',
        cover_image: 'https://covers.openlibrary.org/b/id/8091153-L.jpg',
        description: 'Rules for focused success in a distracted world.',
        genre: 'Productivity',
        page_count: 296,
        current_page: 296,
        status: 'completed',
        is_favorite: true,
        rating: 5,
    },
    // Want to Read
    {
        title: 'System Design Interview',
        author: 'Alex Xu',
        cover_image: 'https://covers.openlibrary.org/b/id/12649369-L.jpg',
        description: 'An insider\'s guide to system design interviews.',
        genre: 'Technology',
        page_count: 320,
        current_page: 0,
        status: 'want-to-read',
        is_favorite: false,
        rating: null,
    },
    {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        cover_image: 'https://covers.openlibrary.org/b/id/10381858-L.jpg',
        description: 'Timeless lessons on wealth, greed, and happiness.',
        genre: 'Finance',
        page_count: 256,
        current_page: 0,
        status: 'want-to-read',
        is_favorite: false,
        rating: null,
    },
    {
        title: 'Refactoring',
        author: 'Martin Fowler',
        cover_image: 'https://covers.openlibrary.org/b/id/8544298-L.jpg',
        description: 'Improving the design of existing code.',
        genre: 'Technology',
        page_count: 448,
        current_page: 0,
        status: 'want-to-read',
        is_favorite: true,
        rating: null,
    },
];

async function seed() {
    console.log('🌱 Starting database seed...\n');
    const dbUrl = process.env.DATABASE_URL;

    const client = new Client({
        connectionString: dbUrl,
        connectionTimeoutMillis: 30000,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check if demo user exists
        const existingUser = await client.query(
            'SELECT id FROM profiles WHERE email = $1',
            [DEMO_USER.email]
        );

        let userId: string;

        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
            console.log('📧 Demo user already exists, using existing user\n');
        } else {
            // Create demo user
            const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
            const userResult = await client.query(
                `INSERT INTO profiles (email, password_hash, username, avatar_url)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [DEMO_USER.email, passwordHash, DEMO_USER.username, 'https://api.dicebear.com/7.x/avataaars/svg?seed=BookLover']
            );
            userId = userResult.rows[0].id;
            console.log('✅ Created demo user');
            console.log(`   Email: ${DEMO_USER.email}`);
            console.log(`   Password: ${DEMO_USER.password}\n`);
        }

        // Clear existing books for this user
        await client.query('DELETE FROM books WHERE user_id = $1', [userId]);
        console.log('🗑️  Cleared existing books\n');

        // Insert sample books
        console.log('📚 Adding sample books...');
        for (const book of SAMPLE_BOOKS) {
            const startedReading = book.status === 'reading' || book.status === 'completed'
                ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
                : null;
            const finishedReading = book.status === 'completed'
                ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
                : null;

            await client.query(
                `INSERT INTO books (user_id, title, author, cover_image, description, genre, page_count, current_page, status, is_favorite, rating, started_reading, finished_reading)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [userId, book.title, book.author, book.cover_image, book.description, book.genre, book.page_count, book.current_page, book.status, book.is_favorite, book.rating, startedReading, finishedReading]
            );
            console.log(`   ✓ ${book.title}`);
        }

        // Create or update reading stats
        const completedBooks = SAMPLE_BOOKS.filter(b => b.status === 'completed');
        const totalPages = completedBooks.reduce((sum, b) => sum + b.page_count, 0);
        const avgRating = completedBooks.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / completedBooks.filter(b => b.rating).length;

        await client.query(
            `INSERT INTO reading_stats (user_id, books_read, total_pages, average_rating, current_streak)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id) DO UPDATE SET
             books_read = $2, total_pages = $3, average_rating = $4, current_streak = $5`,
            [userId, completedBooks.length, totalPages, avgRating, 7]
        );
        console.log('\n📊 Updated reading stats');

        // Create reading challenge
        const currentYear = new Date().getFullYear();
        await client.query(
            `INSERT INTO reading_challenges (user_id, name, target, current, percentage, year)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [userId, `${currentYear} Reading Challenge`, 24, completedBooks.length, (completedBooks.length / 24) * 100, currentYear]
        );
        console.log('🎯 Created reading challenge\n');

        console.log('═'.repeat(50));
        console.log('🎉 Seed completed successfully!\n');
        console.log('Demo credentials:');
        console.log(`   Email: ${DEMO_USER.email}`);
        console.log(`   Password: ${DEMO_USER.password}`);
        console.log('═'.repeat(50));

    } catch (error: any) {
        console.error('❌ Seed failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

seed();
