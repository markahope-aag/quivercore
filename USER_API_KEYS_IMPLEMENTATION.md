# User-Provided API Keys Implementation

## Overview

Implemented Option 3 (Hybrid Approach) for prompt testing with user-provided API keys. Users can choose to save their API keys encrypted in the database, or provide them per-session without saving.

## Problem Solved

**Original Issue**: The test prompt feature was using QuiverCore's API keys, which meant:
- Unlimited API costs for QuiverCore
- Potential for abuse (users treating it as free AI chat)
- No incentive limits on testing

**Solution**: Users bring their own API keys from OpenAI and/or Anthropic.

## Implementation Details

### Database Schema

**New Table**: `user_api_keys`
```sql
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT CHECK (provider IN ('openai', 'anthropic')),
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
);
```

**RLS Policies**: Users can only view/manage their own keys

### Encryption System

**File**: `lib/utils/encryption.ts`

- **Algorithm**: AES-256-GCM
- **Key Derivation**: scrypt from `ENCRYPTION_SECRET` env var
- **Components**: Salt (64 bytes) + IV (16 bytes) + Tag (16 bytes) + Encrypted data
- **Storage**: Combined as hex string in database

**Security Features**:
- Server-side encryption/decryption only
- Keys never sent to client after encryption
- Format validation before storage
- Masked display (shows first 7 and last 4 chars)

### API Endpoints

#### `GET /api/user/api-keys`
Returns user's saved API keys (masked):
```json
{
  "keys": [
    {
      "provider": "openai",
      "masked_key": "sk-proj...xyz",
      "created_at": "2025-01-17...",
      "updated_at": "2025-01-17..."
    }
  ]
}
```

#### `POST /api/user/api-keys`
Save or update an API key:
```json
{
  "provider": "openai",
  "api_key": "sk-..."
}
```

Validates format, encrypts, and upserts to database.

#### `DELETE /api/user/api-keys?provider=openai`
Removes saved API key for specified provider.

### Settings UI

**Location**: Settings page > API Keys section

**Features**:
- Separate cards for OpenAI and Anthropic
- Password-style input with show/hide toggle
- Links to get API keys from providers
- Info banner explaining benefits
- Security & privacy note
- Display existing keys (masked)
- Delete saved keys

**User Experience**:
1. User goes to Settings
2. Clicks on API Keys section
3. Enters their OpenAI/Anthropic key
4. Key is validated client-side (format check)
5. Key is encrypted server-side and stored
6. User sees masked version confirming save

### Test Panel Updates

**Location**: Prompt detail page > Test Prompt section

**Flow**:
1. Component loads and checks for saved API keys
2. If no saved key for selected model's provider:
   - Shows yellow warning card
   - Two options:
     - "Save in Settings" button (links to /settings)
     - "Enter for This Session" button (shows input)
3. Session input:
   - Password field with show/hide toggle
   - Not saved to database
   - Only used for current test
4. Test button:
   - Disabled if no key (saved or session)
   - Shows clear error if key missing
5. On test:
   - Sends `session_api_key` if provided
   - Otherwise uses saved key from database
   - Makes API call with user's key

**Provider Detection**:
- Models starting with `claude-` → Anthropic
- All other models → OpenAI
- Dynamically updates required provider when model changes

### Test API Updates

**File**: `app/api/prompts/[id]/test/route.ts`

**Logic**:
1. Extract `session_api_key` from request body
2. Determine provider from model name
3. Try to get API key:
   - Use `session_api_key` if provided
   - Otherwise, fetch from database and decrypt
4. If no key found, return error
5. Create appropriate SDK client (OpenAI or Anthropic)
6. Make API call with user's key
7. Save test result and increment usage count

**Supported Models**:
- OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview
- Anthropic: claude-3-5-sonnet-20241022, claude-3-opus-20240229

### Environment Setup

**Required Variable**: `ENCRYPTION_SECRET`

**Generation** (choose one):
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

**Local**: Add to `.env.local`
```env
ENCRYPTION_SECRET=your_64_char_hex_string
```

**Production (Vercel)**:
1. Project Settings > Environment Variables
2. Add `ENCRYPTION_SECRET` with your generated value
3. Set for Production environment
4. Redeploy

## Benefits

### For QuiverCore
- **Zero API costs** - users pay for their own usage
- **No abuse risk** - users can't exploit free testing
- **Simpler pricing** - don't need to factor in API costs
- **Better margins** - no variable costs per test

### For Users
- **Transparent costs** - pay only what OpenAI/Anthropic charges
- **No markup** - direct API pricing
- **Unlimited testing** - test as much as their API allows
- **Privacy** - their keys, their data
- **Model choice** - use any model they have access to

## Security Considerations

✅ **Implemented**:
- AES-256-GCM encryption (industry standard)
- Server-side only decryption
- Never log or expose decrypted keys
- Format validation before storage
- RLS policies for database access
- HTTPS required for API calls
- Unique constraint prevents duplicates

⚠️ **User Responsibilities**:
- Keep `ENCRYPTION_SECRET` secure (like a password)
- Don't lose `ENCRYPTION_SECRET` (can't decrypt without it)
- Rotate API keys if compromised
- Monitor their API usage/costs

## User Flows

### First-Time Setup (Saved Keys)
1. User creates prompt/template
2. Clicks "Test Prompt"
3. Sees warning: "OpenAI API Key Required"
4. Clicks "Save in Settings"
5. Navigates to Settings > API Keys
6. Enters their OpenAI API key
7. Clicks "Save OpenAI Key"
8. Sees success toast
9. Returns to prompt
10. Clicks "Test Prompt" (now works)

### One-Time Test (Session Key)
1. User has prompt open
2. Clicks "Test Prompt"
3. Sees warning (no saved key)
4. Clicks "Enter for This Session"
5. Pastes API key in input field
6. Clicks "Test Prompt"
7. Test runs successfully
8. Key is discarded after test

### Regular Usage (With Saved Key)
1. User has already saved API keys
2. Opens any prompt
3. Clicks "Test Prompt"
4. Test runs immediately (no warnings)
5. Uses saved encrypted key automatically

## Testing Checklist

- [ ] Generate `ENCRYPTION_SECRET` and add to `.env.local`
- [ ] Run database migration for `user_api_keys` table
- [ ] Visit Settings > API Keys section
- [ ] Add OpenAI API key (format: `sk-...`)
- [ ] Verify masked key displays correctly
- [ ] Test with OpenAI model (GPT-3.5)
- [ ] Add Anthropic API key (format: `sk-ant-...`)
- [ ] Test with Anthropic model (Claude 3.5 Sonnet)
- [ ] Delete a saved key
- [ ] Try session key input (don't save)
- [ ] Verify error when no key provided
- [ ] Check that tests increment usage_count

## Migration Notes

**Existing Test Data**:
- Old test results from system API keys remain in `prompt_tests` table
- New tests will use user-provided keys
- No data migration needed

**Existing Users**:
- Will see API key warning on first test attempt
- Clear instructions to add keys
- Two options for different use cases

## Future Enhancements

Possible improvements:
1. **API Usage Tracking**: Show user how many tokens they've used
2. **Cost Estimation**: Estimate cost before running test
3. **Key Rotation**: Allow updating keys without deleting
4. **Multiple Keys**: Support multiple keys per provider (org vs personal)
5. **Key Validation**: Test key before saving (make small API call)
6. **Audit Log**: Track when keys are used for testing

## Documentation

Created guides:
- `ENCRYPTION_SECRET_SETUP.md` - Environment variable setup
- `USER_API_KEYS_IMPLEMENTATION.md` - This document

## Files Changed/Created

### New Files
- `supabase/migrations/20250117_add_user_api_keys.sql`
- `lib/utils/encryption.ts`
- `app/api/user/api-keys/route.ts`
- `components/settings/api-keys-section.tsx`
- `ENCRYPTION_SECRET_SETUP.md`
- `USER_API_KEYS_IMPLEMENTATION.md`

### Modified Files
- `app/(dashboard)/settings/page.tsx` - Added API Keys section
- `components/prompts/test-panel.tsx` - Complete rewrite with key handling
- `app/api/prompts/[id]/test/route.ts` - Support user keys + both SDKs

## Deployment Steps

1. **Generate encryption secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to Vercel**:
   - Go to project settings
   - Environment Variables
   - Add `ENCRYPTION_SECRET`
   - Redeploy

3. **Run database migration**:
   - Migration already in `supabase/migrations/`
   - Will run automatically on next Supabase sync

4. **Verify in production**:
   - Navigate to Settings > API Keys
   - Try adding a test key
   - Should encrypt and save successfully

## Summary

This implementation completely solves the API cost concern while providing an excellent user experience. Users have flexibility (save or don't save), QuiverCore has zero API costs, and the security is enterprise-grade with AES-256-GCM encryption.

The hybrid approach (Option 3) was the right choice - it gives power users the convenience of saved keys while allowing cautious users to test without storage.
