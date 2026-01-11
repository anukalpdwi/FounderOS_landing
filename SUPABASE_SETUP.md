# Supabase Setup for Waitlist & Realtime Monitoring

To make the Waitlist and Realtime Counter work, follow these steps:

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once created, go to **Project Settings > API**.
3. Copy the **Project URL** and **anon public key**.

## 2. Configure Environment Variables

1. Create a file named `.env` in the root of your project (`a:\FounderOS Front\.env`).
2. Add the following lines, replacing the values with yours:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

## 3. Create the Database Table

1. Go to the **SQL Editor** in your Supabase dashboard.
2. Run the following SQL query to create the `waitlist` table and enable Realtime:

```sql
-- Create the table
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.waitlist enable row level security;

-- ALLOW ANONYMOUS INSERTS (Crucial for the new flow)
-- Since we are not asking for a password, we need to allow anyone to insert an email.
create policy "Allow public insert"
on public.waitlist for insert
to public
with check (true);

-- Policy for Public read (for the counter)
create policy "Enable read access for all users"
on public.waitlist for select
to public
using (true);

-- Enable Realtime
alter publication supabase_realtime add table public.waitlist;
```

## 4. Restart Development Server

After adding the `.env` file, you may need to restart the development server:

1. Press `Ctrl + C` in the terminal to stop the server.
2. Run `npm run dev` again.

## 5. Setup Email Sending

Since we removed the Auth/Password requirement, we now handle emails using a **Supabase Edge Function**.
Please read `GUIDE_EMAIL_SETUP.md` to set up the notification email.

## Notes

- The current implementation simply inserts the email into the `waitlist` table.
- **IMPORTANT:** You must run the SQL above to `Allow public insert` otherwise the form will fail.
