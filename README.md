# H.I.T.S. Platform

**H.I.T.S. (Hire I.T. Specialists)** - A web platform connecting seniors needing technological help with vetted IT specialists.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database & Auth**: Supabase
- **AI Integration**: Google Gemini AI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Gemini API key
- Stripe account (for payments)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the `env.example` file to `.env.local` and fill in your credentials:

```bash
cp env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `GEMINI_API_KEY` - Your Google Gemini API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key

### 3. Database Setup

1. Open your Supabase project
2. Go to SQL Editor
3. Run the `schema.sql` file to create all tables and relationships

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hitsapp/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── features/          # Feature-specific components
│   └── animations/        # Animation components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── gemini/           # Gemini AI integration
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🎨 Design System

The platform uses a color palette optimized for older adults:

- **Primary**: Soft Navy Blue (#2C5F8D) - Trust, calm, professionalism
- **Secondary**: Warm Light Gray (#E8E6E1) - Reduces glare, adds warmth
- **Accent**: Gentle Teal (#4A9B8E) - Technology and renewal
- **Text**: Dark Gray (#2C2C2C) - Smoother readability

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Environment variables for sensitive data
- Secure authentication via Supabase Auth

## 📚 Documentation

### Quick Start
- **Maintenance Guide**: See `MAINTENANCE_GUIDE.md` for file structure, content updates, deployment, and maintenance instructions
- **Complete Documentation**: See `DOCUMENTATION_INDEX.md` for comprehensive system documentation
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md` for detailed implementation plan and feature specifications

### Key Documentation Files
- `MAINTENANCE_GUIDE.md` - **Start here** for content updates and deployment
- `DOCUMENTATION_INDEX.md` - Complete documentation index
- `DOCUMENTATION_PART_1_ARCHITECTURE_AND_DEPLOYMENT.md` - Architecture & deployment
- `DOCUMENTATION_PART_2_DATABASE_AND_ROLES.md` - Database schema & user roles
- `DOCUMENTATION_PART_3_PAYMENTS_AND_EMAIL.md` - Stripe & email system
- `DOCUMENTATION_PART_4_MESSAGING_TRAVEL_ADMIN.md` - Messaging, travel, admin
- `DOCUMENTATION_PART_5_FRONTEND_CHATBOT_TRANSFER.md` - Frontend, chatbot, resources

## 🤝 Contributing

This is a private project. Please follow the coding standards and accessibility guidelines outlined in the implementation plan.

## 📄 License

ISC

