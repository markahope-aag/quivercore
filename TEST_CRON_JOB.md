# How to Test the Cron Job

## 🧪 Testing the Reset Usage Cron Job

Your app has a cron job that resets monthly usage limits: `/api/cron/reset-usage`

---

## Method 1: Test Locally (Development)

### Step 1: Set Up CRON_SECRET (Optional for Local)

In `.env.local`, add:
```env
CRON_SECRET=test-secret-123
```

**Note:** In development, the cron secret check is skipped, but it's good to have it set.

### Step 2: Test the Endpoint

Open your browser or use curl:

```bash
# Without authorization (works in development)
curl http://localhost:3000/api/cron/reset-usage

# With authorization (recommended)
curl http://localhost:3000/api/cron/reset-usage \
  -H "Authorization: Bearer test-secret-123"
```

Or visit in browser:
```
http://localhost:3000/api/cron/reset-usage
```

### Expected Response

```json
{
  "success": true,
  "usersReset": 5,
  "errors": [],
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

---

## Method 2: Test in Production (Vercel)

### Step 1: Get Your CRON_SECRET

Make sure `CRON_SECRET` is set in Vercel environment variables.

### Step 2: Test the Endpoint

```bash
curl https://your-domain.com/api/cron/reset-usage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Important:** In production, the `Authorization` header is **required**.

### Step 3: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by: `/api/cron/reset-usage`
3. Look for execution logs and any errors

---

## Method 3: Test via Vercel Dashboard

### Option A: Trigger Manually (If Available)

1. Go to Vercel Dashboard → Your Project → **Crons**
2. Find `/api/cron/reset-usage`
3. Click "Trigger" or "Run Now" (if available)

### Option B: Use Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Trigger the cron job
vercel cron trigger reset-usage
```

---

## Method 4: Test with Postman/Thunder Client

### Setup

1. **URL:** `http://localhost:3000/api/cron/reset-usage` (local) or `https://your-domain.com/api/cron/reset-usage` (production)
2. **Method:** `GET`
3. **Headers:**
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```

### Send Request

You should get a JSON response with:
- `success`: boolean
- `usersReset`: number of users whose usage was reset
- `errors`: array of any errors
- `timestamp`: when the job ran

---

## 🔍 What the Cron Job Does

1. **Verifies Authorization** (production only)
2. **Checks Date** - Warns if not the 1st of the month (but still runs)
3. **Gets All Active Subscriptions** from database
4. **Resets Usage** for each user:
   - Creates new `usage_tracking` record for current month
   - Sets `prompts_used: 0`
   - Sets `overage_prompts: 0`
   - Sets `overage_charges: 0`
5. **Returns Summary** of how many users were reset

---

## 📋 Testing Checklist

- [ ] `CRON_SECRET` is set in `.env.local` (for local testing)
- [ ] `CRON_SECRET` is set in Vercel (for production)
- [ ] Test endpoint locally - should work without auth in dev
- [ ] Test endpoint in production - requires auth header
- [ ] Check response includes `success: true`
- [ ] Verify `usersReset` count matches active subscriptions
- [ ] Check database - new usage records created for current month
- [ ] Check Vercel logs for any errors

---

## 🐛 Troubleshooting

### Error: "Cron secret not configured"
- **Solution:** Add `CRON_SECRET` to environment variables

### Error: "Unauthorized" (401)
- **Solution:** Include `Authorization: Bearer YOUR_CRON_SECRET` header

### Error: "No active subscriptions found"
- **This is OK** - just means no users have active subscriptions yet

### Cron Job Not Running Automatically
- **Check:** Vercel Dashboard → Crons → Verify schedule is `0 0 1 * *`
- **Note:** It only runs on the 1st of each month at midnight UTC
- **To test before then:** Use manual trigger methods above

---

## ⚠️ Important Notes

1. **Schedule:** The cron runs on the 1st of each month at 00:00 UTC
2. **Production Security:** Always requires `Authorization` header in production
3. **Development:** Authorization is optional in development mode
4. **Idempotent:** Safe to run multiple times - it upserts records

---

## 🎯 Quick Test Command

**Local:**
```bash
curl http://localhost:3000/api/cron/reset-usage
```

**Production:**
```bash
curl https://your-domain.com/api/cron/reset-usage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 Verify It Worked

After running the cron job, check your database:

```sql
-- Check usage records for current month
SELECT 
  user_id,
  month_year,
  prompts_used,
  prompts_limit,
  overage_prompts,
  reset_date
FROM usage_tracking
WHERE month_year = TO_CHAR(NOW(), 'YYYY-MM')
ORDER BY reset_date DESC;
```

You should see records with:
- `prompts_used: 0`
- `overage_prompts: 0`
- `reset_date` set to today

