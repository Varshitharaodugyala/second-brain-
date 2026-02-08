# Second Brain - AI-Powered Knowledge Management

An intelligent knowledge management application that helps you capture, organize, and query your ideas using AI. Built with Next.js, PostgreSQL, and Google Gemini.

![Second Brain](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![AI](https://img.shields.io/badge/AI-Gemini%202.5-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Core Features
- **Knowledge Capture** - Save notes, links, and insights with rich metadata
- **Smart Dashboard** - Grid/list view with search, filtering, and sorting
- **Tag Management** - Organize content with tags (manual or AI-generated)
- **Responsive Design** - Works seamlessly on desktop and mobile

### AI-Powered Features
- **AI Summarization** - Automatically generate concise summaries when saving content
- **Smart Auto-Tagging** - AI analyzes content and suggests relevant tags
- **Semantic Search** - Find related content by meaning using vector embeddings (MiniLM)
- **Natural Language Queries** - Ask questions about your knowledge base in plain English
- **Contextual Answers** - Get AI-generated answers with source citations

### Bonus Features
- **Command Palette (Cmd+K)** - Quick keyboard navigation to any action
- **Public API** - Query your brain programmatically from external applications
- **Vector Search** - pgvector-powered semantic similarity search

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15, React 19 | App Router, Server Components |
| Styling | Tailwind CSS | Utility-first styling |
| Animations | Framer Motion | Smooth transitions, parallax effects |
| Database | PostgreSQL (Neon) | Serverless PostgreSQL |
| ORM | Prisma 5 | Type-safe database access |
| Vector Search | pgvector + MiniLM | 384-dimensional semantic embeddings |
| AI | Google Gemini 2.5 Flash | Text generation, summarization |
| Command Palette | cmdk | Keyboard-first navigation |

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL database with pgvector extension (Neon recommended)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd second-brain
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:
```env
# Database - PostgreSQL with pgvector (Neon recommended)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# AI - Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"
```

4. **Set up the database:**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Enable pgvector extension (run in your database)
# CREATE EXTENSION IF NOT EXISTS vector;
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open the app:**
Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
second-brain/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Landing page with parallax
│   │   ├── layout.tsx              # Root layout with navbar
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Knowledge dashboard
│   │   ├── docs/
│   │   │   └── page.tsx            # Architecture documentation
│   │   └── api/
│   │       ├── knowledge/
│   │       │   ├── route.ts        # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts    # GET, PATCH, DELETE
│   │       │       └── similar/
│   │       │           └── route.ts # GET similar items
│   │       ├── ai/
│   │       │   ├── summarize/
│   │       │   │   └── route.ts    # POST - Generate summary
│   │       │   ├── auto-tag/
│   │       │   │   └── route.ts    # POST - Generate tags
│   │       │   └── query/
│   │       │       └── route.ts    # POST - Query knowledge
│   │       └── public/
│   │           └── brain/
│   │               └── query/
│   │                   └── route.ts # GET - Public API
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tag-input.tsx
│   │   │   ├── toast.tsx
│   │   │   └── skeleton.tsx
│   │   ├── landing/                # Landing page sections
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   └── cta.tsx
│   │   ├── dashboard/              # Dashboard components
│   │   │   └── dashboard-view.tsx
│   │   ├── knowledge/              # Knowledge item components
│   │   │   ├── knowledge-card.tsx
│   │   │   └── knowledge-form.tsx
│   │   ├── navbar.tsx              # Navigation bar
│   │   └── command-palette.tsx     # Cmd+K palette
│   ├── lib/
│   │   ├── db.ts                   # Prisma client instance
│   │   ├── ai.ts                   # AI service (Gemini + MiniLM)
│   │   └── utils.ts                # Utility functions
│   └── types/
│       └── index.ts                # TypeScript types
├── prisma/
│   └── schema.prisma               # Database schema
├── public/                         # Static assets
├── .env                            # Environment variables
└── package.json
```

## API Endpoints

### Knowledge CRUD

#### List All Items
```http
GET /api/knowledge
```
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in title and content |
| type | string | Filter by type (note, link, insight) |
| tags | string | Comma-separated tags to filter |
| sortBy | string | Sort field (createdAt, updatedAt, title) |
| sortOrder | string | Sort direction (asc, desc) |
| page | number | Page number (default: 1) |
| limit | number | Items per page, max 100 (default: 50) |

**Response:**
```json
{
  "data": [
    {
      "id": "clx123...",
      "title": "Machine Learning Fundamentals",
      "content": "...",
      "type": "note",
      "tags": ["machine learning", "ai"],
      "summary": "AI-generated summary...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

#### Create Item
```http
POST /api/knowledge
Content-Type: application/json

{
  "title": "My Note",
  "content": "Content here...",
  "type": "note",
  "tags": ["tag1", "tag2"],
  "sourceUrl": "https://example.com" // optional
}
```
*Note: AI summarization and embedding generation happens automatically*

#### Get Single Item
```http
GET /api/knowledge/{id}
```

#### Update Item
```http
PATCH /api/knowledge/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Item
```http
DELETE /api/knowledge/{id}
```

#### Find Similar Items
```http
GET /api/knowledge/{id}/similar
```
*Uses vector similarity to find semantically related content*

---

### AI Features

#### Generate Summary
```http
POST /api/ai/summarize
Content-Type: application/json

{
  "content": "Long text to summarize..."
}
```
**Response:**
```json
{
  "summary": "Concise 2-3 sentence summary..."
}
```

#### Auto-Generate Tags
```http
POST /api/ai/auto-tag
Content-Type: application/json

{
  "title": "Article Title",
  "content": "Article content..."
}
```
**Response:**
```json
{
  "tags": ["machine learning", "python", "data science"]
}
```

#### Query Knowledge Base
```http
POST /api/ai/query
Content-Type: application/json

{
  "question": "What is machine learning?"
}
```
**Response:**
```json
{
  "answer": "Based on your knowledge base, machine learning is...",
  "sources": [
    {
      "id": "clx123...",
      "title": "ML Fundamentals",
      "summary": "..."
    }
  ]
}
```

---

### Public API

#### Query Brain (Public Endpoint)
```http
GET /api/public/brain/query?q={question}
```
**Example:**
```bash
curl "https://your-domain.com/api/public/brain/query?q=What%20is%20React"
```
**Response:**
```json
{
  "answer": "Based on your knowledge base, React is a JavaScript library...",
  "sources": [
    {
      "id": "clx123...",
      "title": "React Hooks Guide",
      "type": "note",
      "summary": "Overview of React hooks..."
    }
  ]
}
```

## Database Schema

```prisma
model KnowledgeItem {
  id        String   @id @default(cuid())
  title     String
  content   String
  type      String   // note, link, insight
  tags      String[] // Array of tags
  sourceUrl String?  @map("source_url")
  summary   String?  // AI-generated summary
  embedding Unsupported("vector(384)")? // MiniLM embeddings
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("knowledge_items")
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `↑ / ↓` | Navigate options |
| `Enter` | Select option |
| `Esc` | Close palette/modal |

## Command Palette Actions

- **Navigation:** Home, Dashboard, Documentation
- **Create:** New Note, New Link, New Insight
- **Actions:** Search Knowledge Base

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, and CTA |
| `/dashboard` | Main knowledge management dashboard |
| `/docs` | Architecture documentation |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string with pgvector |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests
npm test

# Type checking
npm run typecheck

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Architecture Highlights

### Portable Design
- AI service abstracted for easy provider swapping
- Database-agnostic via Prisma ORM
- Component-based UI with consistent styling

### AI UX Principles
1. **Transparency** - Users see when AI is working
2. **Graceful Degradation** - App works even if AI fails
3. **User Control** - AI suggestions can be edited/ignored
4. **Progressive Enhancement** - Basic CRUD works without AI
5. **Contextual Assistance** - AI features appear where useful

### Vector Search
- MiniLM model generates 384-dimensional embeddings
- pgvector extension enables efficient similarity search
- Cosine distance used for semantic matching

## Troubleshooting

### Common Issues

**"Model not found" error:**
- Ensure you're using `gemini-2.5-flash` model
- Check your API key is valid

**Database connection failed:**
- Verify `DATABASE_URL` is correct
- Ensure pgvector extension is enabled
- Check SSL mode is set correctly

**Embeddings not working:**
- First request may be slow (model download)
- Check `@xenova/transformers` is installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for **Altibbe/Hedamo Full-Stack Engineering Assessment**

**Author:** Varshitha
**Tech Stack:** Next.js 15 | PostgreSQL | Gemini AI | pgvector
