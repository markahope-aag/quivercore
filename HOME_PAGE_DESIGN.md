# Home Page Design for Logged-In Users

**Date:** 2025-01-16  
**Purpose:** Define the dashboard/home page for logged-in QuiverCore users

---

## 🎯 Overview

The home page should serve as a **central hub** that gives users:
- **Quick overview** of their activity and account status
- **Fast access** to key features and actions
- **Contextual information** based on their usage patterns
- **Onboarding guidance** for new users
- **Productivity tools** for power users
- **Latest news** about technologies, techniques, templates, and product updates

---

## 📊 Page Layout Structure

### 1. **Hero Section** (Top of Page)
**Purpose:** Quick stats and primary actions

**Elements:**
- **Welcome Message** with user's name
- **Quick Stats Cards** (4 cards in a row):
  - Total Prompts
  - Prompts This Month
  - Most Used Prompt (with usage count)
  - Subscription Status Badge
- **Primary Action Buttons**:
  - "Create New Prompt" (primary, large)
  - "Open Prompt Builder" (secondary)
  - "Browse Templates" (tertiary)

**Visual Design:**
- Clean, modern card-based layout
- Gradient background (subtle)
- Prominent CTA buttons
- Responsive grid (stacks on mobile)

---

### 2. **Recent Activity Section**
**Purpose:** Show what the user has been working on

**Elements:**
- **Section Title:** "Recent Activity"
- **Activity Feed** (last 5-10 items):
  - Recently created prompts
  - Recently used prompts
  - Recently edited prompts
  - Recent test executions
- **Each Activity Item Shows:**
  - Prompt title
  - Action type (Created, Used, Edited, Tested)
  - Timestamp (relative: "2 hours ago")
  - Quick action button (View, Edit, Use)
- **"View All Activity" link** at bottom

**Data Source:**
- `prompts` table (created_at, updated_at)
- `usage_tracking` table (prompt_execution)
- `prompt_tests` table (if exists)

---

### 3. **Quick Access Section**
**Purpose:** Fast navigation to key features

**Elements:**
- **Grid of Feature Cards** (2x2 or 3x3):
  1. **Prompt Builder**
     - Icon: Sparkles/Wand
     - Description: "Create prompts with advanced frameworks"
     - Link to `/builder`
  
  2. **Prompt Library**
     - Icon: FileText
     - Description: "Browse and manage your prompts"
     - Link to `/prompts`
  
  3. **Search**
     - Icon: Search
     - Description: "Find prompts by content or tags"
     - Link to `/search`
  
  4. **Templates**
     - Icon: Layout
     - Description: "Browse template library"
     - Link to `/prompts?template=true`
  
  5. **Settings**
     - Icon: Settings
     - Description: "Manage account and preferences"
     - Link to `/settings`
  
  6. **Documentation** (optional)
     - Icon: Book
     - Description: "Learn prompt engineering techniques"
     - External link

**Visual Design:**
- Card-based with icons
- Hover effects
- Clear labels and descriptions

---

### 4. **Usage Statistics Section**
**Purpose:** Show usage metrics and subscription info

**Elements:**
- **Usage Metrics Card:**
  - Prompts created this month
  - Prompts executed this month
  - API calls this month
  - Usage vs. plan limits (progress bars)
  
- **Subscription Status Card:**
  - Current plan name
  - Plan features/limits
  - Billing cycle info
  - Days remaining in trial (if applicable)
  - "Upgrade" or "Manage Subscription" button

**Data Source:**
- `usage_tracking` table
- `user_subscriptions` table
- `subscription_plans` table

---

### 5. **Most Used Prompts Section**
**Purpose:** Quick access to frequently used prompts

**Elements:**
- **Section Title:** "Your Most Used Prompts"
- **List of Top 5 Prompts** (by usage_count):
  - Prompt title
  - Usage count badge
  - Last used date
  - Quick action buttons (Use, Edit, View)
- **"View All Prompts" link**

**Data Source:**
- `prompts` table (sorted by usage_count DESC)

---

### 6. **Getting Started Section** (For New Users)
**Purpose:** Onboard new users

**Conditional Display:** Only show if user has < 3 prompts

**Elements:**
- **Welcome Card** with:
  - "Welcome to QuiverCore!" heading
  - 3-step getting started guide:
    1. "Choose Your Domain" - Link to builder
    2. "Pick a Framework" - Link to builder with framework info
    3. "Apply Enhancements" - Link to builder with enhancement info
  - "Create Your First Prompt" button
  - "Browse Templates" link

**Visual Design:**
- Prominent, friendly design
- Step-by-step visual guide
- Clear CTAs

---

### 7. **Suggested Templates Section**
**Purpose:** Help users discover useful templates

**Elements:**
- **Section Title:** "Suggested Templates"
- **Grid of Template Cards** (3-6 templates):
  - Template title
  - Template description
  - Use case badge
  - Framework badge
  - "Use Template" button
- **"Browse All Templates" link**

**Data Source:**
- `prompts` table (is_template = true)
- Filtered by user's domain preferences or popular templates

---

### 8. **News & Updates Section**
**Purpose:** Keep users informed about new features, techniques, and templates

**Elements:**
- **Section Title:** "News & Updates" with "View All" link
- **News Feed** (3-5 latest items):
  - **News Card** for each item showing:
    - **Category Badge** (New Technology, New Technique, New Template, Product Update, Best Practice)
    - **Title** (e.g., "Introducing Claude 3.5 Sonnet Support")
    - **Excerpt/Description** (1-2 sentences)
    - **Featured Image** (optional, for visual appeal)
    - **Publish Date** (relative: "2 days ago")
    - **Read More** button or link
    - **Tags** (optional, for filtering)
- **Filter Tabs** (optional):
  - All
  - Technologies
  - Techniques
  - Templates
  - Updates
- **"View All News" link** at bottom

**Content Types:**
1. **New Technologies**
   - New AI models (Claude 3.5, GPT-4 Turbo, etc.)
   - New API features
   - Integration announcements
   - Platform updates

2. **New Techniques**
   - Advanced prompting methods
   - VS Enhancement improvements
   - Framework updates
   - Best practice guides
   - Research findings

3. **New Templates**
   - Featured template releases
   - Template collections
   - Community templates
   - Template updates

4. **Product Updates**
   - New features
   - UI improvements
   - Performance enhancements
   - Bug fixes

5. **Best Practices**
   - Prompt engineering tips
   - Case studies
   - Success stories
   - Tutorials

**Visual Design:**
- Card-based layout with images
- Category color coding
- Hover effects
- Clean typography
- Responsive grid (1-3 columns based on screen size)

**Data Source:**
- New database table: `news_items` or `announcements`
- Admin-managed content
- Can be linked to templates, features, or external resources

**Admin Features:**
- Create/edit/delete news items
- Set publish dates
- Feature/unfeature items
- Add images and rich content
- Track views/engagement

### 9. **Quick Tips / Help Section** (Optional)
**Purpose:** Provide contextual help

**Elements:**
- **Collapsible Card** with:
  - "Quick Tips" heading
  - Rotating tips about:
    - Using VS Enhancement
    - Framework best practices
    - Enhancement techniques
    - Keyboard shortcuts
  - "Dismiss" button (remembers user preference)

---

## 🎨 Visual Design Principles

### Layout
- **Grid-based** responsive design
- **Card-based** components for visual hierarchy
- **Spacing:** Generous whitespace between sections
- **Max Width:** 1400px container with padding

### Color Scheme
- **Primary Actions:** Blue (#3b82f6)
- **Success/Stats:** Green (#10b981)
- **Warnings/Info:** Yellow/Amber (#f59e0b)
- **Background:** Gradient from slate-50 to slate-100 (light mode)
- **Cards:** White with subtle shadows

### Typography
- **Page Title:** Large, bold (2xl-3xl)
- **Section Titles:** Medium, semibold (xl)
- **Card Titles:** Regular, medium (lg)
- **Body Text:** Regular (base)

### Icons
- Use Lucide React icons consistently
- Size: 20-24px for cards, 16px for inline

---

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Stacked cards
- Smaller stat cards (2x2 grid)
- Collapsible sections
- Bottom navigation for quick actions

### Tablet (768px - 1024px)
- 2-column grid for cards
- Side-by-side stats
- Maintained spacing

### Desktop (> 1024px)
- 3-4 column grid for feature cards
- Full layout as designed
- Hover effects on interactive elements

---

## 🔄 Data Requirements

### API Endpoints Needed

1. **GET /api/dashboard/stats**
   - Returns: total prompts, prompts this month, usage stats, subscription info
   - Cache: 30 seconds

2. **GET /api/dashboard/recent-activity**
   - Returns: recent prompts, recent usage, recent edits
   - Limit: 10 items
   - Cache: 60 seconds

3. **GET /api/dashboard/most-used**
   - Returns: top 5 prompts by usage_count
   - Cache: 5 minutes

4. **GET /api/dashboard/suggested-templates**
   - Returns: 6 suggested templates
   - Cache: 10 minutes

5. **GET /api/dashboard/news**
   - Returns: latest news items (3-5 items)
   - Query params: `category`, `limit`, `featured`
   - Cache: 5 minutes

### Database Queries

```sql
-- User stats
SELECT 
  COUNT(*) as total_prompts,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as prompts_this_month
FROM prompts
WHERE user_id = $1 AND archived = false;

-- Recent activity
SELECT id, title, created_at, updated_at, usage_count
FROM prompts
WHERE user_id = $1 AND archived = false
ORDER BY GREATEST(created_at, updated_at) DESC
LIMIT 10;

-- Most used prompts
SELECT id, title, usage_count, updated_at
FROM prompts
WHERE user_id = $1 AND archived = false AND usage_count > 0
ORDER BY usage_count DESC
LIMIT 5;

-- Usage tracking
SELECT 
  metric_type,
  SUM(count) as total
FROM usage_tracking
WHERE user_id = $1 
  AND period_start >= date_trunc('month', NOW())
GROUP BY metric_type;

-- News items (latest, published, not expired)
SELECT id, title, excerpt, category, image_url, published_at, featured, link_url
FROM news_items
WHERE published = true 
  AND published_at <= NOW()
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY featured DESC, published_at DESC
LIMIT 5;
```

---

## 🚀 Implementation Priority

### Phase 1: Core Features (MVP)
1. ✅ Hero section with quick stats
2. ✅ Primary action buttons
3. ✅ Recent activity section
4. ✅ Quick access cards
5. ✅ Most used prompts

### Phase 2: Enhanced Features
6. ✅ Usage statistics
7. ✅ Subscription status
8. ✅ Getting started section (new users)
9. ✅ Suggested templates
10. ✅ News & Updates section

### Phase 3: Polish
11. ✅ Quick tips section
12. ✅ News filtering and categories
13. ✅ Animations and transitions
14. ✅ Advanced filtering
15. ✅ Customizable dashboard
16. ✅ News engagement tracking

---

## 💡 User Experience Considerations

### For New Users (< 3 prompts)
- **Emphasize:** Getting started section
- **Show:** Template suggestions prominently
- **Guide:** Step-by-step onboarding
- **Hide:** Advanced stats (not relevant yet)

### For Active Users (3+ prompts)
- **Emphasize:** Recent activity and most used
- **Show:** Usage statistics
- **Provide:** Quick access to frequent actions
- **Display:** All sections

### For Power Users (10+ prompts, high usage)
- **Emphasize:** Statistics and analytics
- **Show:** Advanced metrics
- **Provide:** Bulk actions
- **Display:** All features

---

## 🎯 Success Metrics

### Engagement Metrics
- Time spent on home page
- Click-through rate on primary actions
- Usage of quick access cards
- Template usage from suggestions

### Conversion Metrics
- New prompt creation rate
- Template adoption rate
- Feature discovery rate
- Subscription upgrade rate (from home page)

---

## 📝 Component Structure

```
app/(dashboard)/page.tsx
├── HeroSection
│   ├── WelcomeMessage
│   ├── QuickStats (4 cards)
│   └── PrimaryActions (3 buttons)
├── RecentActivitySection
│   ├── ActivityFeed
│   └── ActivityItem (x10)
├── QuickAccessSection
│   └── FeatureCard (x6)
├── UsageStatsSection
│   ├── UsageMetricsCard
│   └── SubscriptionStatusCard
├── MostUsedPromptsSection
│   └── PromptCard (x5)
├── NewsAndUpdatesSection
│   ├── NewsFilterTabs (optional)
│   └── NewsCard (x3-5)
├── GettingStartedSection (conditional)
│   └── OnboardingCard
├── SuggestedTemplatesSection
│   └── TemplateCard (x6)
└── QuickTipsSection (optional)
    └── TipsCard
```

---

## ✅ Summary

The home page should be a **productive, informative dashboard** that:
- ✅ Gives users immediate context about their account
- ✅ Provides fast access to key features
- ✅ Shows relevant, personalized content
- ✅ Guides new users effectively
- ✅ Supports power users with advanced features
- ✅ Maintains clean, modern design
- ✅ Works beautifully on all devices

**Next Steps:**
1. Create API endpoints for dashboard data
2. Build reusable dashboard components
3. Implement responsive layout
4. Add loading states and error handling
5. Test with different user types (new, active, power)

