import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Signup
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await query('SELECT id FROM profiles WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await query(
            `INSERT INTO profiles (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username, avatar_url, created_at`,
            [email, passwordHash, username || email.split('@')[0]]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar_url: user.avatar_url,
            },
            token,
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await query('SELECT * FROM profiles WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar_url: user.avatar_url,
            },
            token,
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user (verify token)
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

        const result = await query(
            'SELECT id, email, username, avatar_url, created_at FROM profiles WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Auth check error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
