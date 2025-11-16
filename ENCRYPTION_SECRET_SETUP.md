# Encryption Secret Setup Guide

## Overview

QuiverCore uses AES-256-GCM encryption to securely store user API keys in the database. This requires an `ENCRYPTION_SECRET` environment variable.

## Setup Instructions

### 1. Generate a Secure Secret

Generate a cryptographically secure random string. You can use any of these methods:

**Option A: Node.js** (recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Online Generator**
Use a secure password generator to create a 64-character hexadecimal string.

### 2. Add to Environment Variables

**Local Development (.env.local)**
```env
ENCRYPTION_SECRET=your_64_character_hex_string_here
```

**Vercel Production**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - Name: `ENCRYPTION_SECRET`
   - Value: Your generated secret
   - Environment: Production (and Preview if needed)
4. Redeploy your application

**Important**:
- Keep this secret secure - treat it like a password
- Never commit it to version control
- Use the same secret across all environments if you want to share encrypted data
- If you change this secret, all previously encrypted API keys will become unreadable

### 3. Verify Setup

After adding the environment variable:

1. Restart your development server
2. Go to Settings > API Keys
3. Try adding an OpenAI or Anthropic API key
4. If it saves successfully, encryption is working correctly

## Security Best Practices

✅ **DO:**
- Generate a truly random secret (not a dictionary word or pattern)
- Use at least 64 characters (32 bytes)
- Store it securely in your environment variable system
- Rotate it periodically (note: this will invalidate existing encrypted keys)

❌ **DON'T:**
- Use the same secret as other applications
- Share the secret publicly or commit it to git
- Use a weak or guessable secret
- Lose the secret (encrypted data cannot be recovered without it)

## Troubleshooting

### Error: "ENCRYPTION_SECRET environment variable is not set"

**Solution**: Add the `ENCRYPTION_SECRET` to your `.env.local` file and restart your dev server.

### Error: "Failed to decrypt data"

**Possible causes**:
1. The encryption secret changed since the data was encrypted
2. The data was corrupted in the database
3. The encryption algorithm changed

**Solution**: Delete the affected API keys from the database and re-add them.

### In Production (Vercel)

If encryption errors occur in production:
1. Verify the environment variable is set in Vercel
2. Ensure you redeployed after adding the variable
3. Check Vercel logs for any related errors

## How It Works

When a user saves an API key:
1. Frontend sends API key to backend via HTTPS
2. Backend encrypts the key using AES-256-GCM with `ENCRYPTION_SECRET`
3. Encrypted key is stored in the database
4. Original key is never logged or stored anywhere else

When testing a prompt:
1. Backend retrieves encrypted key from database
2. Decrypts it server-side using `ENCRYPTION_SECRET`
3. Uses decrypted key to make API call
4. Discards decrypted key from memory

The decrypted API key is **never** sent to the client or exposed in logs.
