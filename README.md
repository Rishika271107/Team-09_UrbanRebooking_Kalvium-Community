# Urban Company One-Click Rebooking

A production-ready Next.js application that enables users to easily book and rebook home services. Built with a modern tech stack, ensuring high performance, accessibility, and security.

## Features
- **Authentication**: Secure login and signup via Auth.js and bcrypt.
- **Dashboard**: Comprehensive overview of upcoming bookings, recent activities, and quick actions.
- **One-Click Rebooking**: Seamlessly rebook past services with a single click.
- **Analytics**: Beautiful Recharts-powered dashboard showing monthly bookings, spending, and service usage.
- **Profile & Security**: Manage personal info, secure passwords, addresses, and payment methods.
- **Notifications**: Real-time updates for bookings and system events.
- **Reviews**: Leave ratings and reviews for completed services.
- **Global Search**: Debounced search across services, professionals, and bookings.

## Technology Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI conventions
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Auth.js (NextAuth)
- **Validation**: Zod & React Hook Form
- **Charts**: Recharts
- **Testing**: Vitest, React Testing Library

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd urban-company-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   AUTH_SECRET="your-super-secret-key"
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run seed
   ```
   *(Note: The `seed` script uses `tsx prisma/seed.ts` to populate initial services and professionals).*

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow
- **Server Actions**: All mutations are handled securely via Next.js Server Actions in `app/actions/`.
- **Service Layer**: Database queries are abstracted into `services/` to keep Server Actions thin and testable.
- **Testing**: Run tests using `npm run test` (requires configuring vitest scripts in package.json).

## Deployment Steps (Vercel)
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Configure the following environment variables in Vercel:
   - `DATABASE_URL` (Your production PostgreSQL connection string)
   - `AUTH_SECRET` (A strong random string for NextAuth)
4. Override the build command in Vercel if necessary, but the default `next build` works perfectly.
5. Deploy! Prisma schema generation is automatically handled in the postinstall script or Vercel build phase if configured.

## License
MIT
