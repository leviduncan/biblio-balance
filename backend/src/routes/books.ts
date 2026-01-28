import { Router, Request, Response } from 'express';
import { query } from '../db.js';

const router = Router();

// Get all books for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query(
            'SELECT * FROM books WHERE user_id = $1 ORDER BY last_updated DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get books by status
router.get('/user/:userId/status/:status', async (req: Request, res: Response) => {
    try {
        const { userId, status } = req.params;
        const result = await query(
            'SELECT * FROM books WHERE user_id = $1 AND status = $2 ORDER BY last_updated DESC',
            [userId, status]
        );
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get favorite books
router.get('/user/:userId/favorites', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query(
            'SELECT * FROM books WHERE user_id = $1 AND is_favorite = true ORDER BY last_updated DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single book
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM books WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create book
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            userId,
            title,
            author,
            coverImage,
            description,
            genre,
            pageCount,
            currentPage = 0,
            status = 'want-to-read',
            isFavorite = false,
            rating,
        } = req.body;

        const result = await query(
            `INSERT INTO books 
       (user_id, title, author, cover_image, description, genre, page_count, current_page, status, is_favorite, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
            [userId, title, author, coverImage, description, genre, pageCount, currentPage, status, isFavorite, rating]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update book
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build the update query dynamically
        const allowedFields = [
            'title', 'author', 'cover_image', 'description', 'genre',
            'page_count', 'current_page', 'progress_percentage', 'status',
            'rating', 'is_favorite', 'started_reading', 'finished_reading'
        ];

        const setClauses: string[] = ['last_updated = CURRENT_TIMESTAMP'];
        const values: any[] = [];
        let paramCount = 1;

        Object.keys(updates).forEach((key) => {
            // Convert camelCase to snake_case
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

            if (allowedFields.includes(snakeKey)) {
                setClauses.push(`${snakeKey} = $${paramCount}`);
                values.push(updates[key]);
                paramCount++;
            }
        });

        values.push(id);

        const query_str = `UPDATE books SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await query(query_str, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete book
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
