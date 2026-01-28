import { Router, Request, Response } from 'express';
import { query } from '../db.js';

const router = Router();

// Get reading stats for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query(
            'SELECT * FROM reading_stats WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reading stats not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get reading challenges for a user
router.get('/challenges/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentYear = new Date().getFullYear();

        const result = await query(
            'SELECT * FROM reading_challenges WHERE user_id = $1 AND year = $2',
            [userId, currentYear]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create reading challenge
router.post('/challenges', async (req: Request, res: Response) => {
    try {
        const { userId, name, target, year } = req.body;

        const result = await query(
            `INSERT INTO reading_challenges (user_id, name, target, year, current, percentage)
       VALUES ($1, $2, $3, $4, 0, 0)
       RETURNING *`,
            [userId, name, target, year || new Date().getFullYear()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create or update reading stats
router.post('/user', async (req: Request, res: Response) => {
    try {
        const { userId, booksRead = 0, totalPages = 0, readingTime = 0, currentStreak = 0, averageRating = 0 } = req.body;

        // Try to update first
        const existing = await query(
            'SELECT id FROM reading_stats WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            const result = await query(
                `UPDATE reading_stats SET books_read = $1, total_pages = $2, reading_time = $3, 
         current_streak = $4, average_rating = $5, last_updated = CURRENT_TIMESTAMP 
         WHERE user_id = $6 RETURNING *`,
                [booksRead, totalPages, readingTime, currentStreak, averageRating, userId]
            );
            return res.json(result.rows[0]);
        }

        // Insert new
        const result = await query(
            `INSERT INTO reading_stats (user_id, books_read, total_pages, reading_time, current_streak, average_rating)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [userId, booksRead, totalPages, readingTime, currentStreak, averageRating]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update reading stats
router.patch('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { booksRead, totalPages, readingTime, currentStreak, averageRating } = req.body;

        const setClauses: string[] = ['last_updated = CURRENT_TIMESTAMP'];
        const values: any[] = [];
        let paramCount = 1;

        if (booksRead !== undefined) {
            setClauses.push(`books_read = $${paramCount}`);
            values.push(booksRead);
            paramCount++;
        }
        if (totalPages !== undefined) {
            setClauses.push(`total_pages = $${paramCount}`);
            values.push(totalPages);
            paramCount++;
        }
        if (readingTime !== undefined) {
            setClauses.push(`reading_time = $${paramCount}`);
            values.push(readingTime);
            paramCount++;
        }
        if (currentStreak !== undefined) {
            setClauses.push(`current_streak = $${paramCount}`);
            values.push(currentStreak);
            paramCount++;
        }
        if (averageRating !== undefined) {
            setClauses.push(`average_rating = $${paramCount}`);
            values.push(averageRating);
            paramCount++;
        }

        values.push(userId);
        const queryStr = `UPDATE reading_stats SET ${setClauses.join(', ')} WHERE user_id = $${paramCount} RETURNING *`;
        const result = await query(queryStr, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reading stats not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
