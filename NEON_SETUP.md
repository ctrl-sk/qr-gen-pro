# Vercel Neon Database Setup Instructions

## Environment Variables Setup

Create a `.env.local` file in your project root with the following content:

```bash
# Database Configuration for Vercel Neon
DATABASE_URL="postgresql://neondb_owner:npg_aUpNoP2VAW1v@ep-nameless-credit-adk2jx7s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_aUpNoP2VAW1v@ep-nameless-credit-adk2jx7s.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Parameters for constructing your own connection string
PGHOST="ep-nameless-credit-adk2jx7s-pooler.c-2.us-east-1.aws.neon.tech"
PGHOST_UNPOOLED="ep-nameless-credit-adk2jx7s.c-2.us-east-1.aws.neon.tech"
PGUSER="neondb_owner"
PGDATABASE="neondb"
PGPASSWORD="npg_aUpNoP2VAW1v"

# Parameters for Vercel Postgres Templates
POSTGRES_URL="postgresql://neondb_owner:npg_aUpNoP2VAW1v@ep-nameless-credit-adk2jx7s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://neondb_owner:npg_aUpNoP2VAW1v@ep-nameless-credit-adk2jx7s.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
POSTGRES_USER="neondb_owner"
POSTGRES_HOST="ep-nameless-credit-adk2jx7s-pooler.c-2.us-east-1.aws.neon.tech"
POSTGRES_PASSWORD="npg_aUpNoP2VAW1v"
POSTGRES_DATABASE="neondb"
POSTGRES_URL_NO_SSL="postgresql://neondb_owner:npg_aUpNoP2VAW1v@ep-nameless-credit-adk2jx7s-pooler.c-2.us-east-1.aws.neon.tech/neondb"
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_aUpNoP2VAW1v@ep-nameless-credit-adk2jx7s-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"

# Neon Auth environment variables for Next.js
NEXT_PUBLIC_STACK_PROJECT_ID="****************************"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="****************************************"
STACK_SECRET_SERVER_KEY="***********************"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Migration Commands

After setting up the environment variables, run these commands:

```bash
# Generate Prisma client
npx prisma generate

# Create and run initial migration
npx prisma migrate dev --name init

# Optional: Push schema directly to database (alternative to migrate)
# npx prisma db push
```

## Vercel Deployment Setup

For Vercel deployment, add these environment variables in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add all the variables from the `.env.local` file above
4. Make sure to set `NEXT_PUBLIC_APP_URL` to your production domain

## Changes Made

1. ✅ Updated `prisma/schema.prisma` to use PostgreSQL provider
2. ✅ Updated `src/lib/db.ts` with better logging configuration
3. ✅ Provided environment variable configuration
4. ⏳ Ready for database migration once environment variables are set

## Next Steps

1. Create the `.env.local` file with the provided content
2. Run `npx prisma migrate dev --name init` to create the database tables
3. Deploy to Vercel with the environment variables configured
