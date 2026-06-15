# Awards Voting SaaS Platform - Frontend

A production-ready, multi-tenant SaaS platform for hosting, managing, and running secure online voting events for awards and recognition.

## 🎯 Overview

This is a full-featured frontend for a voting platform with support for:
- **Voters**: Cast votes with secure payment processing
- **Organizers**: Create and manage voting events with real-time analytics
- **Admins**: Platform management, organization/subscription oversight
- **Public**: Marketing site, pricing, and award discovery

## 📋 Prerequisites

- Node.js 18+ or bun
- npm, yarn, or pnpm (pnpm recommended)
- Git

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd awards-voting-platform

# Install dependencies (using pnpm)
pnpm install

# Or using npm
npm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env.local` and fill in your configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Payment Processing (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_key
PAYSTACK_SECRET_KEY=your_paystack_secret

# App Configuration
NEXT_PUBLIC_APP_NAME=Awards Voting
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from Settings → API
3. Add them to `.env.local`

### 4. Initialize Database Schema

Create the following tables in your Supabase database:

#### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL, -- 'voter', 'organizer', 'admin', 'super_admin'
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### organizations table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  description TEXT,
  logo_url TEXT,
  website VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
  subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### events table
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
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'voting_open', 'voting_closed', 'completed'
  price_per_vote DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD', -- 'USD', 'GHS', 'NGN', 'KES'
  voting_method VARCHAR(50) DEFAULT 'single', -- 'single', 'multiple', 'weighted'
  allow_international BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### categories table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### nominees table
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
```

#### votes table
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_id UUID NOT NULL REFERENCES nominees(id),
  voter_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  quantity INT NOT NULL DEFAULT 1,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_method VARCHAR(50), -- 'card', 'mobile_money', 'bank_transfer'
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### payments table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID NOT NULL REFERENCES users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  method VARCHAR(50), -- 'card', 'mobile_money', 'bank_transfer'
  transaction_id VARCHAR(255),
  reference VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  plan VARCHAR(50) NOT NULL, -- 'free', 'starter', 'professional', 'enterprise'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Run Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js 16 app router
│   ├── (public)/          # Public pages (marketing site)
│   ├── (auth)/            # Authentication pages
│   ├── voter/             # Voter-specific pages
│   ├── organizer/         # Organizer dashboard
│   ├── admin/             # Admin back-office
│   ├── api/               # API routes (for backend integration)
│   └── layout.tsx         # Root layout
│
├── components/
│   ├── shared/            # Global components (Navigation, Footer, AuthGuard)
│   ├── public/            # Marketing components
│   ├── voter/             # Voter-specific components
│   ├── organizer/         # Organizer-specific components
│   ├── admin/             # Admin-specific components
│   └── ui/                # Shadcn/ui components
│
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts            # Authentication utilities
│   ├── api.ts             # API client
│   ├── validators.ts      # Form validation schemas (Zod)
│   ├── constants.ts       # App constants
│   └── utils.ts           # Utility functions
│
├── types/
│   ├── database.ts        # Database schema types
│   ├── forms.ts           # Form and API types
│   └── index.ts           # Type exports
│
├── public/                # Static assets
├── .env.example           # Environment variables template
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Project dependencies
```

## 🎨 Design System

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts

### Color Palette
- **Primary**: Blue (`#0066ff`)
- **Secondary**: Slate
- **Destructive**: Red
- **Muted**: Gray

## 🔐 Authentication

The platform uses Supabase Auth with email/password authentication. User roles determine access:

- **voter**: Can vote and manage voting history
- **organizer**: Can create and manage events
- **admin**: Can manage organizations and payments
- **super_admin**: Full platform access

## 📦 Key Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "@hookform/resolvers": "^3.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "recharts": "^2.x",
  "qrcode.react": "^1.x",
  "axios": "^1.x",
  "lucide-react": "^latest",
  "@radix-ui/react-tabs": "^1.x"
}
```

## 🔄 Data Flow

### Voter Flow
1. Voter signs in or creates account
2. Enters event code via chatbot assistant
3. Browses nominees in event
4. Selects nominee and vote quantity
5. Proceeds to checkout
6. Completes payment
7. Receives confirmation and votes are recorded

### Organizer Flow
1. Signs up as organizer
2. Creates event using multi-step wizard
3. Adds categories and nominees
4. Publishes event and generates sharing link
5. Monitors real-time vote counts and revenue
6. Declares winners and closes event

### Admin Flow
1. Logs into admin dashboard
2. Reviews organization and event metrics
3. Manages subscriptions and payments
4. Views audit logs and system health

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts to connect your repository and deploy. Vercel will automatically:
- Build your Next.js app
- Deploy to CDN
- Setup automatic deployments on push

### Environment Variables

Set the following environment variables in your Vercel project settings:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Redeploy

## 🧪 Testing

```bash
# Run tests (when configured)
pnpm test

# Run linter
pnpm lint

# Check TypeScript
pnpm type-check
```

## 📝 Components & Features

### Public Pages
- ✅ Homepage with hero and features
- ✅ Pricing page
- ✅ About page
- ✅ Awards discovery page

### Authentication
- ✅ Sign up page
- ✅ Sign in page
- ✅ Password reset flow (placeholder)

### Voter Experience
- ✅ Chatbot-style event code assistant
- ✅ Nominee detail page with vote selector
- ✅ Checkout with multiple payment methods
- ✅ Voting history dashboard

### Organizer Dashboard
- ✅ Event creation wizard (4-step form)
- ✅ Event management interface
- ✅ Analytics dashboard (placeholder)
- ✅ Nominee management
- ✅ Winner selection

### Admin Back-Office
- ✅ Platform metrics dashboard
- ✅ Organization management
- ✅ Event oversight
- ✅ Payment tracking
- ✅ Subscription management
- ✅ Audit logs

## 🔄 Integration Points

This frontend is **ready for backend integration**:

1. **Authentication**: Supabase Auth handles sessions
2. **Database**: All types match Supabase schema
3. **API Client**: Pre-configured axios client in `/lib/api.ts`
4. **Form Validation**: Zod schemas ready for server-side validation
5. **Real-time**: Supabase realtime subscriptions prepared for vote updates

### API Endpoints to Implement

Backend should implement:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `GET /api/votes`
- `POST /api/votes`
- `POST /api/payments`
- `GET /api/analytics/events/:id`

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

## 🆘 Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check that your Supabase project is active
- Ensure database tables are created

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm dev
```

### TypeScript Errors
```bash
# Type check
pnpm type-check

# Fix errors
pnpm lint --fix
```

## 📄 License

This project is proprietary. Unauthorized copying or distribution is prohibited.

## 💼 Support

For issues, feature requests, or questions:
- Email: support@awards-voting.com
- GitHub Issues: [Create an issue](https://github.com)

---

**Ready to launch your first voting event?** Start by creating an account and running your first event locally!
