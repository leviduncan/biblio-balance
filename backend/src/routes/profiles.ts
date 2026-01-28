import { Router, Request, Response } from 'express';
import { query } from '../db.js';

const router = Router();

// Get profile
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await query('SELECT * FROM profiles WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create profile
router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, username, avatarUrl } = req.body;

        const result = await query(
            `INSERT INTO profiles (id, username, avatar_url) VALUES ($1, $2, $3) RETURNING *`,
            [id, username, avatarUrl]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile
router.patch('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { username, avatarUrl } = req.body;

        const result = await query(
            `UPDATE profiles SET username = COALESCE($1, username), avatar_url = COALESCE($2, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [username, avatarUrl, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
