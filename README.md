# Barmods Full Pterodactyl Web Creator

This is a minimal Next.js App (App Router) that allows an admin to create users and servers on a Pterodactyl panel via the Application API.

Features:
- Minimal login (username: `barmods`, password: `barmods21`) for UI access
- Admin token protection for server API (set ADMIN_TOKEN in environment)
- RAM selection buttons (1GB..9GB + Unlimited)
- Creates Pterodactyl user and server via Application API

## Quick setup (local)
1. Copy `.env.example` -> `.env.local` and fill values (set ADMIN_TOKEN and NEXT_PUBLIC_ADMIN_TOKEN to the same secret).
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

## Deploy to Vercel
1. Push this repository to GitHub.
2. Import project in Vercel and set these Environment Variables (Production):
   - PTERO_DOMAIN
   - PTERO_API_KEY
   - PTERO_LOCATION_ID
   - PTERO_EGG_ID
   - PTERO_CPU
   - PTERO_DISK
   - ADMIN_TOKEN (server-only)
   - NEXT_PUBLIC_ADMIN_TOKEN (public, must equal ADMIN_TOKEN)
   - NEXT_PUBLIC_PTERO_DOMAIN (optional)
3. Deploy.

## How to use
- Login on UI using username: `barmods` and password: `barmods21`.
- Choose RAM button (1GB..9GB or Unlimited).
- Click "Create Server" — the API will create a Pterodactyl user and a server for that user and return credentials.

## Security notes
- For this minimal app the UI uses a static username/password. This is convenient but not secure for production.
- ADMIN_TOKEN is required to protect the serverless API; set a strong random token.
- Keep `PTERO_API_KEY` secret and only in Vercel environment variables (do not commit to repo).
