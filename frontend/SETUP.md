# 🚀 Aquila Portfolio – Full Setup Guide

Everything is wired. Follow these steps in order and your portfolio will be 100% live with real email, real database, and real image uploads.

---

## Step 1 — Install New Dependencies

```bash
cd aquila
npm install @supabase/supabase-js resend
```

---

## Step 2 — Create Your Supabase Project (Free)

1. Go to **supabase.com** → Sign up with GitHub or email
2. Click **"New project"** → Choose a name (e.g. `aquila`) → Set a DB password → Click Create
3. Wait ~2 minutes for the project to spin up
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_KEY` ⚠️ Keep this secret!

### Run the database schema:
5. In Supabase Dashboard → **SQL Editor** → **New query**
6. Paste the entire contents of `supabase/schema.sql`
7. Click **Run** — all tables and storage buckets will be created

---

## Step 3 — Create Your Resend Account (Free)

1. Go to **resend.com** → Sign up with the email you want to receive messages at (`wilfredaquila@gmail.com`)
2. Go to **API Keys** → Create a new key → Copy it (this is your `RESEND_API_KEY`)

> **Important:** On the free plan without a custom domain, Resend can only send to the email you signed up with. Since your contact form sends TO your own inbox, this works perfectly. The visitor's message arrives in your Gmail, with their email set as Reply-To so you can reply directly to them.

> **Later:** When you get `xcognvis.com` set up, add it to Resend and you can send from `noreply@xcognvis.com` for a more professional appearance.

---

## Step 4 — Set Up Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Open `.env.local` and fill in all values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
RESEND_API_KEY=re_...
CONTACT_EMAIL=wilfredaquila@gmail.com
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_SECRET=any_random_32_character_string_here
```

For `ADMIN_SECRET`, just type any random characters — e.g. `xK9mP2nQ8rT4vW1aB6eH3jL7`. It's used to sign session cookies.

---

## Step 5 — Run Locally to Test

```bash
npm run dev
```

Open http://localhost:3000 and test:
- **Contact form** → fill it in → check your Gmail inbox (may take 30–60 seconds)
- **Admin portal** → http://localhost:3000/admin → log in with your `ADMIN_PASSWORD`
  - Add a project with image upload (drag & drop)
  - Add a blog post
  - Check http://localhost:3000/projects → your new project appears immediately
- **Gallery** → upload a real photo via drag & drop → check http://localhost:3000/gallery

---

## Step 6 — Deploy to Vercel

1. Push your code to GitHub (if not already)
2. Go to **vercel.com** → Import your GitHub repo
3. During setup, click **"Environment Variables"** and add all 7 variables from your `.env.local`
4. Click **Deploy**

Your site is live! Every change you make in the admin portal now instantly updates the live site.

---

## How It All Works Now

| Feature | Before | After |
|---------|--------|-------|
| Contact form | Fake delay, goes nowhere | Real email in your Gmail |
| Admin login | Password visible in browser code | Secure server-side cookie |
| Admin edits | localStorage only, invisible to visitors | Supabase database, live immediately |
| Image upload | URL paste only | Drag & drop → Supabase CDN |
| Public pages | Static hardcoded data | Live database fetch |

---

## Admin Portal Usage

Once deployed, go to `yoursite.com/admin`:

- **Projects** → Add/edit/delete projects. Drag & drop project images.
- **Blog** → Write posts in Markdown. Toggle Live/Draft.
- **Gallery** → Drag & drop images. They upload to Supabase Storage and get a CDN URL.
- **Videos** → Paste any YouTube URL. It embeds on the Video Studio page.
- **Settings** → Update your name, bio, social links.

All changes go live on the public site within seconds — no redeploy needed.

---

## Updating Your Profile Photos

After uploading photos via the Gallery section:
1. Copy the Supabase Storage URL of your photo
2. Open `data/portfolio.ts`
3. Replace the placeholder URLs in the `profileImages` object
4. Commit and push → Vercel auto-deploys in ~1 minute

---

## Security Notes

- Your `ADMIN_PASSWORD` and `ADMIN_SECRET` are **server-side only** — never exposed to the browser
- The session cookie is `httpOnly` — JavaScript cannot read it
- All write operations (add/edit/delete) require a valid session cookie
- Public read of your portfolio data requires no auth (it's a portfolio, it's meant to be public)
