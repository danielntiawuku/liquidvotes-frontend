# Setup Guide -  SaaS Platform

This guide walks you through setting up the Awards Voting Platform frontend in your local development environment and preparing it for production deployment.

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Supabase Configuration](#supabase-configuration)
3. [Running the Application](#running-the-application)
4. [Project Structure Overview](#project-structure-overview)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Deployment to Vercel](#deployment-to-vercel)

---

## 🔧 Local Development Setup

### Step 1: System Requirements

Before you begin, ensure you have:
- **Node.js**: Version 18.x or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Git**: For version control
- **VS Code** (optional): Recommended editor with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin

### Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/awards-voting-platform.git

# Navigate to project directory
cd awards-voting-platform
```

### Step 3: Install Dependencies

Using pnpm (recommended for faster installs):

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install

# Verify installation
pnpm --version
```

Or using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### Step 4: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your configuration
nano .env.local  # or use your preferred editor
```

The key variables you need:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# API (Set to your backend URL or localhost:3000 for development)
NEXT_PUBLIC_API_URL=http://localhost:3000

# App Settings
NEXT_PUBLIC_APP_NAME=LiquidVotes
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔌 Supabase Configuration

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: `awards-voting` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### Step 2: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

### Step 3: Create Database Tables

In Supabase SQL Editor, run the following SQL scripts to create all required tables:

**1. Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'voter', -- 'voter', 'organizer', 'admin', 'super_admin'
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  organization_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_organization_id_idx ON users(organization_id);
CREATE INDEX users_role_idx ON users(role);
```

**2. Organizations Table:**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX organizations_owner_id_idx ON organizations(owner_id);
CREATE INDEX organizations_subscription_plan_idx ON organizations(subscription_plan);
```

**3. Events Table:**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  banner_url TEXT,
  logo_url TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  price_per_vote DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  voting_method VARCHAR(50) DEFAULT 'single',
  allow_international BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX events_organization_id_idx ON events(organization_id);
CREATE INDEX events_status_idx ON events(status);
CREATE INDEX events_created_at_idx ON events(created_at);
```

**4. Categories Table:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX categories_event_id_idx ON categories(event_id);
```

**5. Nominees Table:**
```sql
CREATE TABLE nominees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url TEXT,
  unique_code VARCHAR(50) NOT NULL UNIQUE,
  total_votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX nominees_category_id_idx ON nominees(category_id);
CREATE INDEX nominees_unique_code_idx ON nominees(unique_code);
```

**6. Votes Table:**
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_id UUID NOT NULL REFERENCES nominees(id),
  voter_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  quantity INT NOT NULL DEFAULT 1,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX votes_voter_id_idx ON votes(voter_id);
CREATE INDEX votes_nominee_id_idx ON votes(nominee_id);
CREATE INDEX votes_event_id_idx ON votes(event_id);
```

**7. Payments Table:**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  method VARCHAR(50),
  transaction_id VARCHAR(255),
  reference VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX payments_voter_id_idx ON payments(voter_id);
CREATE INDEX payments_status_idx ON payments(status);
```

**8. Subscriptions Table:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX subscriptions_organization_id_idx ON subscriptions(organization_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
```

### Step 4: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. Configure email settings:
   - Go to **Settings** → **Auth** → **Email Settings**
   - Configure email sender (optional)
   - Copy your JWT settings if needed

### Step 5: Set Up Row Level Security (RLS)

For production, enable RLS policies. Example for voters:

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Voters can only see their own votes
CREATE POLICY "Voters can see own votes" ON votes
  FOR SELECT USING (auth.uid() = voter_id);

-- Voters can only see their own profile
CREATE POLICY "Users can see own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

---

## ▶️ Running the Application

### Start Development Server

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
# Using pnpm
pnpm build

# Using npm
npm run build

# Using yarn
yarn build
```

### Start Production Server

```bash
# Using pnpm
pnpm start

# Using npm
npm start

# Using yarn
yarn start
```

---

## 📁 Project Structure Overview

```
├── app/                          # Next.js 16 App Router
│   ├── (public)/                 # Marketing pages (public route group)
│   │   ├── layout.tsx           # Public layout with nav/footer
│   │   ├── page.tsx             # Homepage
│   │   ├── pricing/page.tsx      # Pricing page
│   │   ├── about/page.tsx        # About page
│   │   └── awards/page.tsx       # Awards discovery
│   ├── (auth)/                  # Authentication pages
│   │   ├── layout.tsx           # Auth layout (centered)
│   │   ├── signup/page.tsx       # Sign up form
│   │   └── login/page.tsx        # Login form
│   ├── voter/                   # Voter-protected routes
│   │   ├── layout.tsx           # Voter layout with AuthGuard
│   │   ├── assistant/page.tsx    # Chatbot code entry
│   │   ├── nominee/[code]/page.tsx # Vote for nominee
│   │   ├── checkout/page.tsx     # Payment checkout
│   │   └── dashboard/page.tsx    # Voting history
│   ├── organizer/               # Organizer-protected routes
│   │   ├── layout.tsx           # Organizer layout
│   │   ├── dashboard/page.tsx    # Event overview
│   │   ├── events/
│   │   │   ├── new/page.tsx     # Event creation wizard
│   │   │   ├── [eventId]/page.tsx # Event management
│   │   │   ├── [eventId]/nominees/page.tsx
│   │   │   ├── [eventId]/analytics/page.tsx
│   │   │   └── [eventId]/winners/page.tsx
│   ├── admin/                   # Admin-protected routes
│   │   ├── layout.tsx           # Admin layout
│   │   ├── dashboard/page.tsx    # Admin overview
│   │   ├── organizations/page.tsx
│   │   ├── events/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   └── audit-logs/page.tsx
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── votes/
│   │   ├── payments/
│   │   └── webhooks/
│   └── layout.tsx               # Root layout (typography, globals)
│
├── components/
│   ├── shared/                  # Reusable components
│   │   ├── Navigation.tsx        # Header with user menu
│   │   ├── Footer.tsx            # Footer
│   │   └── AuthGuard.tsx         # Protected route wrapper
│   ├── public/                  # Marketing components
│   │   ├── HeroSection.tsx
│   │   └── PricingCards.tsx
│   ├── voter/                   # Voter UI components
│   │   ├── ChatbotAssistant.tsx
│   │   ├── NomineeCard.tsx
│   │   └── CheckoutForm.tsx
│   ├── organizer/               # Organizer UI components
│   │   ├── EventWizard.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   └── NomineeForm.tsx
│   ├── admin/                   # Admin UI components
│   │   ├── OrgTable.tsx
│   │   └── PaymentsTable.tsx
│   └── ui/                      # Shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── tabs.tsx
│
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── auth.ts                  # Auth utilities & functions
│   ├── api.ts                   # API client with axios
│   ├── validators.ts            # Zod schemas for validation
│   ├── constants.ts             # App constants (pricing, countries, etc.)
│   └── utils.ts                 # Utility functions (cn, formatting, etc.)
│
├── types/
│   ├── database.ts              # Database schema types
│   ├── forms.ts                 # Form input/response types
│   └── index.ts                 # Type exports
│
├── public/                      # Static files
│   └── images/
│
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (git-ignored)
├── .gitignore
├── README.md                    # Main documentation
├── SETUP.md                     # This file
├── package.json
├── tsconfig.json
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tailwind.css                # Global styles
```

---

## 🔄 Development Workflow

### 1. Create a New Feature

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes
# (Add files, modify code, etc.)

# Run tests and linting
pnpm lint
pnpm type-check

# Commit and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 2. Component Development

When adding new components:

1. Create the component file in appropriate `/components` subdirectory
2. Import shadcn/ui components if needed
3. Use TypeScript for type safety
4. Add JSDoc comments for public APIs
5. Test in dev server

### 3. Form Development

When adding new forms:

1. Create a Zod schema in `lib/validators.ts`
2. Create the form component using React Hook Form
3. Import the schema type with `as const`
4. Handle loading and error states
5. Call API through `lib/api.ts`

### 4. Database Changes

When modifying the database:

1. Test changes in Supabase dashboard
2. Copy SQL migration to a `.sql` file in `migrations/` (if tracking)
3. Update `types/database.ts` accordingly
4. Update API functions in `lib/api.ts`

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/components/ui/card'"

**Solution:**
- The component hasn't been added yet
- Run: `pnpm dlx shadcn@latest add card`
- Or create it manually from shadcn registry

### Issue: Supabase connection fails

**Solution:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify they're set in .env.local and not .env
# Check project is active at supabase.com
```

### Issue: "NEXT_PUBLIC_SUPABASE_URL is missing"

**Solution:**
```bash
# Make sure you have .env.local file
ls -la .env.local

# Copy from example if missing
cp .env.example .env.local

# Edit with your actual values
```

### Issue: "Cannot read property 'user' of undefined"

**Solution:**
- User likely not authenticated
- Ensure your auth flow redirects to login page
- Check AuthGuard is properly wrapping pages
- Verify Supabase session is persisted

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill the process using port 3000
# On macOS/Linux:
lsof -i :3000
kill -9 <PID>

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
pnpm dev -- -p 3001
```

---

## 🚀 Deployment to Vercel

### Prerequisites

- GitHub account with repository
- Vercel account
- All environment variables documented

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add remote
git remote add origin https://github.com/your-username/awards-voting.git

# Commit and push
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Connect your GitHub account and select the repository
4. Configure project settings:
   - **Framework**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
5. Add environment variables:
   - Go to "Environment Variables"
   - Add all variables from `.env.local`
6. Click "Deploy"

### Step 3: Configure Production Environment

After deployment:

1. Update `NEXT_PUBLIC_API_URL` in Vercel project settings:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

2. Configure custom domain:
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Update DNS records

3. Enable automatic deployments:
   - Any push to `main` branch deploys to production
   - Pull requests get preview deployments

### Step 4: Database & Secrets

Ensure Supabase project is accessible from Vercel:

1. Whitelist Vercel IPs in Supabase (if using IP restriction)
2. Verify environment variables are correct
3. Test API connection from deployed app

---

## 📞 Getting Help

- **Documentation**: See [README.md](./README.md)
- **Issues**: Check GitHub issues for existing solutions
- **Community**: Reach out to the team
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**You're all set!** Your development environment is ready. Start the dev server with `pnpm dev` and begin building! 🎉
