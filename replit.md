# Khalil Investment Platform

## Overview

The Khalil Investment Platform is a comprehensive multi-sector investment ecosystem that enables users to manage investments across stocks, cryptocurrency, real estate, e-commerce, and social media in a unified dashboard. The platform features role-based access control with separate admin and user experiences, real-time market data integration, and commission-based revenue generation through referrals and affiliates.

## Recent Changes

**November 19, 2025 - Module Reorganization**:
- Merged P2P Trading functionality into Wallet page using a tabbed interface
  - Wallet tab: Deposit, Withdraw, Transfer operations
  - P2P Trading tab: Buy Orders, Sell Orders, My Orders
- Merged Ambassador Program into Referrals page using tabs
  - Referral Program tab: Referral code management, rewards tracking
  - Ambassador Program tab: Application, tier status, sales tracking
- Simplified navigation by removing standalone P2P and Ambassador menu items
- Admin P2P Management remains as separate admin panel feature

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, using Vite as the build tool and development server.

**UI Framework**: shadcn/ui component library built on Radix UI primitives, styled with Tailwind CSS following a custom design system inspired by professional financial platforms (Robinhood, Coinbase, Bloomberg Terminal) and modern SaaS dashboards (Linear, Stripe Dashboard).

**Design Philosophy**: The application emphasizes trust, professionalism, and data clarity with a carefully defined color palette:
- Primary: Dark blue (#1a237e) for headers, sidebar, and primary actions
- Accent: Gold (#ffd700) for CTAs and highlights
- Supporting colors for success/warning/error states aligned with financial contexts

**State Management**: TanStack Query (React Query) handles server state management and caching, with custom query functions for API interactions.

**Routing**: Client-side routing implemented through page state management in the main App component, supporting both user and admin navigation flows.

**Theme System**: Custom theming with light/dark mode support, implemented via CSS variables and a theme provider context. The design system uses three font families: Inter (UI/body), Poppins (headings/numbers), and JetBrains Mono (financial data).

### Backend Architecture

**Runtime**: Node.js with Express.js framework using ESM modules.

**API Design**: RESTful API architecture with session-based authentication via Passport.js using local strategy (username/password).

**Session Management**: PostgreSQL-backed sessions using connect-pg-simple for production-ready session storage.

**Authentication Flow**: 
- User registration with bcrypt password hashing
- Login with Passport local strategy
- Role-based access control (admin/user roles)
- Session persistence across server restarts

**Security**:
- Password hashing with bcryptjs
- Session secrets for production environments
- CSRF protection through session-based authentication
- User blocking capabilities for administrative control

**Business Logic**: 
- Referral system with unique code generation
- Affiliate program with commission tracking
- Investment approval workflow (pending/approved/rejected)
- Property listing moderation
- Product status management (active/pending/flagged)
- Social media post scheduling (draft/scheduled/published)

### Data Storage

**Primary Database**: PostgreSQL via Neon serverless with WebSocket connections for real-time capabilities.

**ORM**: Drizzle ORM with TypeScript schema definitions providing type-safe database operations.

**Database Schema Design**:
- **Users**: Core user table with role-based access, blocking capability, and referral code system
- **Investments**: Project-based investments with ROI tracking, status workflow, and commission calculations
- **Properties**: Real estate listings with type classification (residential/commercial/land), location data, and approval workflow
- **Products**: E-commerce product catalog with status management and stock tracking
- **Posts**: Social media content with multi-platform support and scheduling
- **Referrals**: User referral tracking with reward systems
- **Affiliates**: Affiliate partnership management with unique codes
- **Affiliate Sales**: Commission tracking for affiliate-generated sales
- **Social Connections**: OAuth tokens for social media platform integrations
- **Email Notifications**: User notification preferences and history
- **User Preferences**: Customizable user settings
- **Settings**: Platform-wide configuration (commissions, API keys, email SMTP)

**Schema Patterns**: 
- UUID primary keys for all tables
- Timestamp tracking (createdAt, updatedAt)
- Soft deletes via status enums where appropriate
- Decimal precision for financial calculations (12,2 for amounts, 5,2 for percentages)

### External Dependencies

**Email Service**: Nodemailer with configurable SMTP settings stored in database settings table. Supports transactional emails for notifications and bulk communications.

**Market Data APIs** (Referenced but not yet integrated):
- Alpaca API for stock market data
- Finnhub for financial data
- Polygon.io for market analytics

**E-commerce Integrations** (Referenced but not yet integrated):
- Shopify API for product sync
- WooCommerce REST API for product management

**Social Media APIs** (Referenced but not yet integrated):
- Facebook Graph API
- Instagram Basic Display API
- LinkedIn API
- TikTok API
- Twitter API v2

**Maps Integration** (Referenced but not yet integrated):
- Google Maps API for property location services

**AI Services** (Referenced but not yet integrated):
- OpenAI API for AI-powered social media caption generation

**Development Tools**:
- Replit-specific plugins for development environment integration
- Vite plugins for runtime error overlay and development banners
- Drizzle Kit for database migrations

### Configuration Management

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required in production)
- Email SMTP settings stored in database for runtime configuration

**Build Process**:
- Development: `tsx` for TypeScript execution with hot reload
- Production: Vite builds frontend, esbuild bundles backend as ESM
- Database: Drizzle Kit handles schema synchronization