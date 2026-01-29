# 📚 Book Tracker

A full-stack reading tracker that helps you organize your library, track reading progress, and visualize your reading habits over time.

**[Live Demo](https://booktracker.darrinduncan.com)** | **[Portfolio](https://darrinduncan.com)**

![Book Tracker Dashboard](./screenshot.png)

---

## What It Does

Book Tracker lets you manage your personal reading library with a clean, intuitive dashboard. Track what you're currently reading, set yearly reading goals, and see your progress through interactive charts and statistics.

**Key Features:**

- **Library Management** — Add books manually or search via Google Books API, organize by status (reading, completed, want to read)
- **Progress Tracking** — Update current page, track reading streaks, and monitor time spent reading
- **Reading Challenges** — Set yearly book goals and visualize progress toward your target
- **Dashboard Analytics** — View books read, average ratings, genre distribution, and monthly reading trends
- **Favorites & Ratings** — Mark favorites and rate completed books for quick reference

---

## Built With

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | Component architecture with hooks |
| **TypeScript** | Type safety across the codebase |
| **Vite** | Fast dev server and optimized builds |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible UI components built on Radix |
| **React Query** | Server state management and caching |
| **React Hook Form + Zod** | Form handling with schema validation |
| **Recharts** | Data visualization for reading stats |
| **React Router** | Client-side routing |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe backend logic |
| **PostgreSQL** | Relational database for persistent storage |
| **JWT + bcrypt** | Secure authentication |
| **Docker** | Containerized deployment |

---

## Technical Highlights

**What makes this project interesting:**

1. **Custom Authentication System** — Built JWT-based auth from scratch with secure password hashing (bcrypt), token validation middleware, and protected API routes. No third-party auth services.

2. **Full-Stack Type Safety** — TypeScript on both frontend and backend ensures consistent data shapes across the entire application, from database queries to React components.

3. **Optimistic UI with React Query** — Mutations update the UI immediately while syncing with the server in the background, providing a responsive user experience even on slower connections.

4. **Automated CI/CD Pipeline** — GitHub Actions workflow builds the frontend, containerizes the backend with Docker, and deploys both to a self-hosted server with zero manual intervention.

5. **RESTful API Design** — Clean separation between frontend and backend with well-structured endpoints for books, reading stats, challenges, and user profiles.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React + Vite   │────▶│  Express API    │────▶│   PostgreSQL    │
│  (Frontend)     │     │  (Backend)      │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Caddy          │     │  Docker         │
│  (Reverse Proxy)│     │  (Container)    │
└─────────────────┘     └─────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/leviduncan/biblio-balance.git

# Navigate to project directory
cd biblio-balance

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

The API runs at `http://localhost:3001`

### Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:3001/api
```

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/booktracker
JWT_SECRET=your-secret-key
PORT=3001
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/books/user/:id` | Get user's books |
| POST | `/api/books` | Add new book |
| PATCH | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| GET | `/api/reading-stats/user/:id` | Get reading statistics |
| GET | `/api/reading-stats/challenges/:id` | Get reading challenge |

---

## What I Learned

Building this project reinforced the value of owning the full stack. By implementing authentication, database design, and API architecture myself rather than relying on backend-as-a-service solutions, I gained deeper understanding of how these systems work together. The experience of debugging CORS issues, managing database connections, and setting up Docker deployments translates directly to real-world production challenges.

---

## Future Enhancements

- [ ] Social features — follow friends, share reading lists, see what others are reading
- [ ] Reading notes — add highlights and annotations per book
- [ ] Import/export — sync with Goodreads, export to CSV
- [ ] Mobile PWA — offline support and home screen installation
- [ ] Reading timer — track actual reading sessions with start/stop functionality

---

## License

MIT License — feel free to use this project for learning

---

## Connect

Built by **Darrin Duncan** — Frontend Developer

- Portfolio: [darrinduncan.com](https://darrinduncan.com)
- LinkedIn: [linkedin.com/in/darrinduncan](https://linkedin.com/in/darrinduncan)
- Email: darrin@darrinduncan.com

---

If you found this project helpful, consider giving it a star!
