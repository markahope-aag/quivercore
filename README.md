# QuiverCore

A Next.js application for organizing and managing AI prompts, email templates, and snippets with advanced prompt enhancement features.

## Features

- 🎯 **Prompt Builder** - Create and enhance AI prompts with advanced techniques
- 🔍 **Semantic Search** - Find prompts using vector embeddings
- 📝 **Template Management** - Organize prompts with tags, categories, and favorites
- 🚀 **Claude Integration** - Execute prompts using Anthropic's Claude models
- 🔒 **Secure** - Server-side API key handling, never exposed to clients

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (for database and authentication)
- An Anthropic API key (for Claude model execution)

### Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Supabase:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project or use an existing one
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key
   - Add them to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Configure Anthropic API Key:**
   - Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
   - Create a new API key or use an existing one
   - Add it to `.env.local`:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-...
     ```
   - **Important:** This key is used server-side only and is never exposed to the client

4. **Optional - OpenAI API Key (for embeddings):**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an API key
   - Add it to `.env.local`:
     ```
     OPENAI_API_KEY=sk-...
     ```

### Install Dependencies

```bash
npm install
```

### Run Database Migrations

Set up your Supabase database schema:

```bash
# Run the schema SQL in your Supabase SQL editor
# See: supabase/migrations/schema.sql
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `ANTHROPIC_API_KEY` (server-side only)
     - `OPENAI_API_KEY` (optional, for embeddings)

4. **Deploy:**
   - Vercel will automatically deploy on push
   - Or click "Deploy" in the dashboard

### Environment Variables Reference

| Variable | Required | Description | Where to Get It |
|----------|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous/public key | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |
| `ANTHROPIC_API_KEY` | ✅ Yes | Anthropic API key for Claude models | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| `OPENAI_API_KEY` | ⚠️ Optional | OpenAI API key for embeddings | [OpenAI Platform](https://platform.openai.com/api-keys) |

**Security Note:** The `ANTHROPIC_API_KEY` is only used server-side and is never exposed to the browser. It's safe to add to Vercel environment variables.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
