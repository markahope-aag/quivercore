# Admin Panel Setup & User Guide

## ✅ Migration Complete!

The admin panel database migration has been successfully applied. Now follow these steps to get started.

---

## 🔐 Step 1: Add Yourself as Admin

1. **Go to Supabase SQL Editor**
   - Open your Supabase project dashboard
   - Navigate to: **SQL Editor** in the left sidebar

2. **Find Your User ID**
   ```sql
   SELECT id, email, created_at
   FROM auth.users
   ORDER BY created_at DESC
   LIMIT 10;
   ```
   - Find your email in the results
   - Copy the `id` (UUID)

3. **Add Yourself as Admin**
   ```sql
   INSERT INTO admin_users (user_id, notes)
   VALUES (
     'YOUR-USER-ID-HERE',  -- Paste your user ID
     'Primary admin'
   );
   ```

4. **Verify Admin Access**
   ```sql
   SELECT
     au.id,
     au.user_id,
     u.email,
     au.created_at
   FROM admin_users au
   JOIN auth.users u ON au.user_id = u.id;
   ```
   - You should see your email in the results!

---

## 🚀 Step 2: Access the Admin Panel

1. **Login to your app** at `http://localhost:3000` (or your deployment URL)

2. **Navigate to Admin Panel**
   - You should now see "Admin Panel" in the sidebar (with red "ADMIN" badge)
   - Click it to access `/admin`

3. **Explore the Tabs**:
   - **Dashboard** - Overview stats, recent users, prompt analytics
   - **Revenue** - MRR, ARR, churn rate, revenue trends
   - **Users** - Search and manage users
   - **Subscriptions** - View and filter subscriptions
   - **Analytics** - Growth metrics, conversion funnel, retention
   - **Errors** - Application error tracking
   - **Promo Codes** - Create and manage discount codes
   - **Feature Flags** - Control feature rollouts
   - **Testing** - Enhancement testing tools

---

## 📊 What Each Section Does

### 💰 Revenue Dashboard (`/admin/revenue`)
**Metrics**:
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- 30-day Churn Rate
- Total Revenue (all time)
- Revenue by Plan breakdown
- Revenue trend (last 12 months)
- Month-over-month growth

**Use Cases**:
- Track financial health
- Monitor subscription growth
- Identify revenue trends
- Compare plan performance

---

### 👥 Users (`/admin/users`)
**Features**:
- Search users by email
- Filter by plan or subscription status
- View 20 users per page with pagination
- Click "View Details" to see:
  - User profile information
  - Subscription status and plan
  - Total prompts created
  - Recent activity
  - Usage history
  - Billing history

**Actions** (via API):
- Suspend/unsuspend users
- View detailed user analytics
- Track user engagement

---

### 💳 Subscriptions (`/admin/subscriptions`)
**Features**:
- View all subscriptions
- Filter by status: active, trialing, canceled, past_due
- See subscription details:
  - User email
  - Plan name and price
  - Current period end date
  - Status badge

**Use Cases**:
- Monitor active subscriptions
- Track trial conversions
- Identify at-risk subscriptions (past_due)
- Analyze subscription distribution

---

### 📈 Analytics (`/admin/analytics`)
**Metrics**:
- **Conversion Funnel**:
  - Total signups
  - Users who created first prompt (%)
  - Users who converted to paid (%)

- **User Growth**:
  - Signups per month (last 12 months)
  - Visual trend chart

- **30-Day Retention**:
  - Retention rate by cohort
  - Users still active after 30 days

- **Engagement**:
  - Average prompts per user by plan
  - Identify power users

**Use Cases**:
- Optimize onboarding flow
- Improve conversion rates
- Track product-market fit
- Compare plan engagement

---

### 🚨 Error Tracking (`/admin/errors`)
**Features**:
- View unresolved errors by default
- Filter by error type (api_error, client_error, server_error)
- See error counts by type
- Mark errors as resolved
- View error details:
  - Error message
  - Error code
  - Timestamp
  - Associated user (if applicable)

**Use Cases**:
- Monitor application health
- Quickly identify and fix bugs
- Track error patterns
- Maintain system stability

---

### 🏷️ Promo Codes (`/admin/promo-codes`)
**Features**:
- Create promotional codes with:
  - Custom code (e.g., SUMMER2024)
  - Description
  - Discount type: Percentage or Fixed Amount
  - Discount value
  - Max uses (optional)
  - Expiration date (optional)

- View active codes with:
  - Usage tracking (X / Y uses)
  - Expiration status
  - Active/inactive badge

**Use Cases**:
- Run marketing campaigns
- Offer discounts to specific users
- Track promotion effectiveness
- Limited-time offers

**Example Codes**:
```sql
-- 20% off for new users
Code: WELCOME20
Type: percentage
Value: 20
Max Uses: 100

-- $10 off first month
Code: FIRSTMONTH10
Type: fixed_amount
Value: 1000 (in cents)
Expiration: 2024-12-31
```

---

### ⚡ Feature Flags (`/admin/feature-flags`)
**Features**:
- Create feature flags with:
  - Flag key (e.g., new_ui_enabled)
  - Display name
  - Description
  - Enabled/disabled toggle
  - Rollout percentage (0-100%)
  - Plan restrictions (optional)
  - Specific users (optional)

- Toggle features on/off instantly
- Gradual rollouts (e.g., 10% of users)
- A/B testing support

**Use Cases**:
- Beta test new features
- Gradual rollouts to minimize risk
- A/B test feature variations
- Emergency kill switches
- Plan-specific features

**Example Flags**:
```
Flag: ai_prompt_suggestions
Name: AI Prompt Suggestions
Rollout: 25% (gradual rollout)
Plans: professional, enterprise

Flag: advanced_templates
Name: Advanced Templates
Rollout: 100%
Plans: enterprise only
```

---

### 🧪 Testing (`/admin/testing`)
**Features**:
- Run enhancement tests
- Validate prompt quality
- Test individual enhancements
- Test enhancement combinations
- View detailed test results

**Use Cases**:
- Quality assurance
- Feature validation
- Regression testing
- Enhancement debugging

---

## 🔧 Advanced Features

### Promotional Code Usage
When users apply promo codes during checkout:
1. Code validation happens automatically
2. Usage count increments
3. Discount applies to subscription
4. Usage tracked in `promo_code_usage` table

### Feature Flag Evaluation
The system automatically checks:
1. Is the flag enabled globally?
2. Is the user in the enabled_for_users list?
3. Does the user's plan match enabled_for_plans?
4. Does the user fall within the rollout percentage?

Use the `is_feature_enabled()` function in your code:
```typescript
// Check if feature is enabled for a user
const { data } = await supabase
  .rpc('is_feature_enabled', {
    p_flag_key: 'new_ui_enabled',
    p_user_id: userId
  });

if (data) {
  // Show new UI
} else {
  // Show old UI
}
```

---

## 📝 Database Functions Available

### Revenue Functions
```sql
-- Get MRR breakdown
SELECT * FROM calculate_mrr();

-- Get churn rate (last 30 days)
SELECT * FROM calculate_churn_rate(30);
```

### User Functions
```sql
-- Get detailed user info
SELECT * FROM get_user_details('user-id-here');

-- Get failed payments
SELECT * FROM get_failed_payments(30);
```

### Admin Functions
```sql
-- Log admin action (called automatically by API)
SELECT log_admin_action(
  'admin-user-id',
  'user_suspend',
  'target-user-id',
  'user',
  'user-id',
  '{"reason": "TOS violation"}'::jsonb,
  '127.0.0.1'
);

-- Check if feature enabled for user
SELECT is_feature_enabled('flag_key', 'user-id');
```

---

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Only admins can access admin tables
   - Users can only see their own data

2. **Audit Logging**
   - All admin actions are logged
   - Tracks who, what, when, and why
   - IP address tracking
   - View logs in `audit_logs` table

3. **Admin Access Control**
   - Middleware checks admin status
   - API routes protected with `requireAdmin()`
   - UI conditionally rendered for admins

---

## 📊 Monitoring Best Practices

### Daily Checks
- [ ] Review error logs (any critical errors?)
- [ ] Check failed payments (follow up needed?)
- [ ] Monitor MRR trend (growing or declining?)

### Weekly Reviews
- [ ] Analyze user growth (meeting targets?)
- [ ] Review churn rate (acceptable level?)
- [ ] Check conversion funnel (any bottlenecks?)
- [ ] Review support tickets (common issues?)

### Monthly Planning
- [ ] Revenue analysis (projections on track?)
- [ ] Feature flag rollouts (complete gradual releases)
- [ ] Promo code effectiveness (ROI positive?)
- [ ] User engagement by plan (plan value alignment?)

---

## 🎯 Quick Actions

### Add Another Admin
```sql
INSERT INTO admin_users (user_id, notes)
VALUES ('user-id-here', 'Team member - Support');
```

### Create a Promo Code (Direct SQL)
```sql
INSERT INTO promotional_codes (
  code, description, discount_type, discount_value,
  max_uses, valid_until, is_active
) VALUES (
  'LAUNCH50',
  'Launch week special - 50% off',
  'percentage',
  50,
  100,
  '2024-12-31',
  true
);
```

### Create a Feature Flag (Direct SQL)
```sql
INSERT INTO feature_flags (
  flag_key, name, description,
  is_enabled, rollout_percentage
) VALUES (
  'beta_feature',
  'Beta Feature',
  'New experimental feature',
  true,
  10  -- 10% rollout
);
```

---

## 🐛 Troubleshooting

### Can't See Admin Panel?
1. Check you're in `admin_users` table
2. Clear browser cache and cookies
3. Log out and log back in
4. Check browser console for errors

### Revenue Not Showing?
- Ensure you have subscriptions in `user_subscriptions`
- Check `subscription_plans` has price data
- Verify billing_history has paid invoices

### Feature Flags Not Working?
- Check flag is enabled (`is_enabled = true`)
- Verify rollout percentage
- Check plan restrictions match user's plan
- Test with `is_feature_enabled()` function

---

## 🚀 Next Steps

Now that your admin panel is set up, you can:

1. **Monitor your business metrics** in real-time
2. **Manage users and subscriptions** efficiently
3. **Run promotions** with promo codes
4. **Control feature rollouts** with flags
5. **Track errors and issues** proactively
6. **Analyze growth trends** for data-driven decisions

Your SaaS is now equipped with enterprise-grade admin capabilities! 🎉

---

## 📞 Need Help?

- Review API routes in `app/api/admin/`
- Check components in `components/admin/`
- View database schema in `supabase/migrations/20250116_add_admin_features.sql`
- Test functions in Supabase SQL Editor

Happy managing! 🚀
