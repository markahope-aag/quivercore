# Backend Architecture

## Overview

**Backend:** Next.js API Routes (Server-Side)  
**Frontend:** React (via Next.js)  
**Framework:** Next.js 16.0.3 (Full-Stack Framework)

---

## Architecture Pattern

This is a **monolithic full-stack Next.js application** where:

- **Frontend:** React components in `app/` and `components/`
- **Backend:** API routes in `app/api/`
- **Both run in the same Next.js server**

---

## Backend Components

### 1. Next.js API Routes (`app/api/`)

All API endpoints are server-side routes that:
- Run on the Next.js server (Node.js runtime)
- Have access to server-side environment variables
- Can securely use API keys (Stripe, Anthropic, OpenAI)
- Handle authentication via Supabase
- Process requests and return JSON responses

**Example Structure:**
```
app/api/
├── subscriptions/
│   ├── create-checkout/route.ts    ← Server-side API route
│   ├── create-portal/route.ts      ← Server-side API route
│   ├── webhook/route.ts             ← Server-side API route
│   └── ...
├── prompts/
│   ├── route.ts                     ← Server-side API route
│   └── execute/route.ts             ← Server-side API route
└── ...
```

### 2. Server-Side Execution

**How it works:**
1. Client (React) makes HTTP request to `/api/subscriptions/create-checkout`
2. Next.js server receives request
3. API route handler (`route.ts`) executes server-side
4. Server can:
   - Access environment variables (`process.env.STRIPE_SECRET_KEY`)
   - Query Supabase database
   - Call Stripe API securely
   - Return response to client

**Example Flow:**
```typescript
// Client-side (React)
fetch('/api/subscriptions/create-checkout', {
  method: 'POST',
  body: JSON.stringify({ priceId: 'price_123' })
})

// Server-side (Next.js API Route)
// app/api/subscriptions/create-checkout/route.ts
export async function POST(request: NextRequest) {
  // This runs on the SERVER
  const stripe = getStripeServer() // Uses STRIPE_SECRET_KEY
  const session = await stripe.checkout.sessions.create(...)
  return NextResponse.json({ sessionId: session.id })
}
```

---

## Key Backend Features

### 1. **Server-Side Only Code**
- API keys never exposed to client
- Secure database queries
- Webhook signature verification
- Authentication checks

### 2. **Environment Variables**
Server-side routes can access:
```env
STRIPE_SECRET_KEY=sk_...          ← Server-only
ANTHROPIC_API_KEY=sk_...          ← Server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...  ← Client-accessible
```

### 3. **Database Access**
- Direct Supabase queries via `createClient()` from `@/lib/supabase/server`
- Row Level Security (RLS) policies enforced
- Server-side authentication

### 4. **External API Calls**
- Stripe API (subscriptions, payments)
- Anthropic API (Claude models)
- OpenAI API (embeddings)

---

## Request Flow

### Subscription Checkout Example:

```
┌─────────────┐
│   React     │
│  Component  │
└──────┬──────┘
       │
       │ fetch('/api/subscriptions/create-checkout')
       │
       ▼
┌─────────────────────────────┐
│   Next.js Server            │
│   (Node.js Runtime)          │
│                              │
│  app/api/subscriptions/     │
│  create-checkout/route.ts    │
│                              │
│  1. Authenticate user        │
│  2. Get Stripe secret key    │
│  3. Create checkout session  │
│  4. Return client secret     │
└──────┬──────────────────────┘
       │
       │ HTTP Response
       │
       ▼
┌─────────────┐
│   React     │
│  Component  │
│  (Receives  │
│   response) │
└─────────────┘
```

---

## Why Next.js API Routes?

### Advantages:
1. **Single Codebase** - Frontend and backend in one project
2. **Type Safety** - Shared TypeScript types between client/server
3. **No Separate Backend** - No need for Express, FastAPI, etc.
4. **Automatic Deployment** - Deploy to Vercel (or any Node.js host)
5. **Built-in Optimizations** - Caching, middleware, etc.

### When to Use:
- ✅ Perfect for: Full-stack web applications
- ✅ Perfect for: API routes that need server-side secrets
- ✅ Perfect for: Server-side rendering (SSR)
- ✅ Perfect for: Middleware and authentication

### When NOT to Use:
- ❌ Long-running background jobs (use separate worker)
- ❌ Real-time WebSocket connections (use separate service)
- ❌ Heavy computational tasks (use separate service)

---

## Deployment

### Vercel (Recommended)
- Automatically detects Next.js
- Deploys both frontend and API routes
- Handles serverless functions automatically
- Environment variables configured in dashboard

### Other Platforms
- Any Node.js hosting (Railway, Render, AWS, etc.)
- Runs `next start` command
- API routes work as server endpoints

---

## Security

### Server-Side Protection:
- ✅ API keys never sent to client
- ✅ Authentication checked on every request
- ✅ Input sanitization
- ✅ Webhook signature verification
- ✅ Rate limiting (via middleware)

### Client-Side:
- Only receives public data
- Never sees secret keys
- Makes authenticated requests via cookies

---

## Summary

**Backend = Next.js API Routes**

- Location: `app/api/**/route.ts`
- Runtime: Node.js (server-side)
- Access: Server-only environment variables
- Security: API keys protected server-side
- Database: Direct Supabase access
- External APIs: Stripe, Anthropic, OpenAI

This is a **full-stack Next.js application** where the same framework handles both frontend (React) and backend (API routes).

