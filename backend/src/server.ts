import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import bookRoutes from './routes/books';
import profileRoutes from './routes/profiles';
import readingStatsRoutes from './routes/reading-stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'], // Your Vite dev server
    credentials: true,
}));
app.use(express.json());

// Development Content Security Policy: allow connections from local dev servers
app.use((req: Request, res: Response, next: NextFunction) => {
    const connectSrc = [
        "'self'",
        'http://localhost:3001',
        'ws://localhost:3001',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8083',
    ].join(' ');

    const csp = `default-src 'self'; connect-src ${connectSrc}; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';`;
    res.setHeader('Content-Security-Policy', csp);
    next();
});
// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

// Routes
// Health check / root route
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Biblio Balance API is running' });
});

// Respond to Chrome DevTools well-known request to avoid 404 + CSP noise in dev
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    // Ensure CSP is present on this response as well
    const connectSrc = [
        "'self'",
        'http://localhost:3001'
    ].join(' ');
    const csp = `default-src 'self'; connect-src ${connectSrc}; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';`;
    res.setHeader('Content-Security-Policy', csp);
    res.status(200).send(JSON.stringify({ "com.chrome.devtools": true }));
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/reading-stats', readingStatsRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
