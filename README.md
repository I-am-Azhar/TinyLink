# TinyLink

A production-ready URL shortener built with Next.js, PostgreSQL, and Tailwind CSS. Create short links, track clicks, and view analytics with a clean, modern interface.

## Features

- 🔗 Create short links with custom or auto-generated codes
- 📊 Track click analytics and view detailed statistics
- 🔍 Search and filter your links
- 📋 One-click copy to clipboard
- 🚀 Fast redirects with atomic click counting
- 🏥 Health check endpoint for monitoring

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/I-am-Azhar/TinyLink.git
   cd TinyLink
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   DATABASE_URL=postgresql://user:password@host:5432/tinylink
   BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

   Replace the `DATABASE_URL` with your PostgreSQL connection string.

4. **Set up the database**

   Run the database setup script:

   ```bash
   node scripts/create-table.mjs
   ```

   Or manually run the SQL schema:

   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with `pg` driver
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Runtime**: Node.js

## Project Structure

```
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/             # Database and utility functions
├── scripts/         # Database setup scripts
├── sql/             # SQL schema files
└── public/          # Static assets
```

## API Endpoints

- `GET /api/links` - List all links (supports `?search=query`)
- `POST /api/links` - Create a new link
- `GET /api/links/[code]` - Get a specific link
- `DELETE /api/links/[code]` - Delete a link
- `GET /:code` - Redirect to destination URL
- `GET /healthz` - Health check endpoint

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository into Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `BASE_URL` (your Vercel deployment URL)
4. Deploy

The database setup script should be run manually on your PostgreSQL instance before the first deployment.

## License

MIT
