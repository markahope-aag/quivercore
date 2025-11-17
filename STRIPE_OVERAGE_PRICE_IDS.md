# Stripe Overage Price IDs

## The 3 Overage Price IDs

These are used to charge users for each prompt they use **above** their monthly subscription limit:

| Plan | Overage Price ID | Rate per Prompt |
|------|-----------------|-----------------|
| **Explorer** | `price_1STsfkAjII6lIBnkpdiBfQRl` | $0.75 |
| **Researcher** | `price_1STskXAjII6lIBnkTfNDe7TH` | $0.75 |
| **Strategist** | `price_1STsn1AjII6lIBnk60vPpusj` | $0.50 |

---

## Database Column

These are stored in the `subscription_plans` table in the `stripe_price_id_overage` column.

## SQL to Update Database

```sql
-- Explorer Plan Overage ($0.75 per prompt)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsfkAjII6lIBnkpdiBfQRl'
WHERE name = 'explorer';

-- Researcher Plan Overage ($0.75 per prompt)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STskXAjII6lIBnkTfNDe7TH'
WHERE name = 'researcher';

-- Strategist Plan Overage ($0.50 per prompt)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsn1AjII6lIBnk60vPpusj'
WHERE name = 'strategist';
```

---

## Complete List of All 9 Price IDs

| Plan | Monthly | Annual | Overage |
|------|---------|--------|---------|
| **Explorer** | `price_1STshaAjII6lIBnkmV4yR35n` | `price_1SUF2IAjII6lIBnkHoqsYg6i` ✅ | `price_1STsfkAjII6lIBnkpdiBfQRl` |
| **Researcher** | `price_1STsiuAjII6lIBnkTVHhA54U` | `price_1SUF0YAjII6lIBnkrcwhrUFI` ✅ | `price_1STskXAjII6lIBnkTfNDe7TH` |
| **Strategist** | `price_1STslRAjII6lIBnkWxwAXEWJ` | `price_1SUEyEAjII6lIBnkJFoir7pB` ✅ | `price_1STsn1AjII6lIBnk60vPpusj` |

✅ = Already added to `.env.local`

