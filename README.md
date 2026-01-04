# MyRecipes - ספר המתכונים שלי

Hebrew-language recipe management application that syncs recipes from WhatsApp and creates a searchable library.

## Features

- 🔄 Automatic sync from WhatsApp group
- 🔍 Full-text Hebrew search
- 📱 Responsive design with RTL support
- 🌐 Support for text recipes, website links, and Instagram stories
- 🔗 Original link preservation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn

### Installation

```bash
yarn install
```

### Database Setup

This app uses PostgreSQL. You can use:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech) (recommended for free tier)
- [Supabase](https://supabase.com)

1. Create a PostgreSQL database with one of the providers above.

2. Create a `.env.local` file in the root directory:
```bash
DATABASE_URL="postgresql://user:password@host:5432/myrecipes?sslmode=require"
NEXT_PUBLIC_APP_URL=http://localhost:7001
```

3. Generate Prisma client and push schema:
```bash
yarn db:generate
yarn db:push
```

### Development

```bash
yarn dev
```

Open [http://localhost:7001](http://localhost:7001) in your browser.

### Build

```bash
yarn build
yarn start
```

### Database Commands

- `yarn db:generate` - Generate Prisma Client
- `yarn db:push` - Push schema changes to database
- `yarn db:migrate` - Create and run migrations
- `yarn db:studio` - Open Prisma Studio (database GUI)

## Deployment to Vercel

### 1. Set up a PostgreSQL database

Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Neon](https://neon.tech):

1. Create a new database
2. Copy the connection string

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/myrecipes)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL (e.g., `https://myrecipes.vercel.app`) |

### 4. Push Database Schema

After deployment, push the database schema:

```bash
npx prisma db push
```

Or run this command in Vercel's deployment logs.

## Project Structure

```
myrecipes/
├── app/                 # Next.js App Router
│   ├── components/     # React components
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript types
│   └── page.tsx        # Home page
├── lib/                # Shared libraries
│   └── db/             # Database utilities
├── plan/               # Project planning documents
└── public/             # Static assets
```

## Hebrew Language Support

The application is fully localized in Hebrew with:
- RTL (Right-to-Left) layout
- Hebrew fonts (Assistant, Heebo, Alef)
- Hebrew search functionality

## License

Private project
