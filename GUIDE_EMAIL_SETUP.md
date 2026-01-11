# Setting up "Official Email" for Waitlist

Since we are no longer using Supabase Auth (Sign Up), we need a way to send a confirmation email when a user is added to the database.

The best professional way to do this is using **Supabase Edge Functions** combined with an Email API like **Resend**.

## Prerequisites

1.  **Supabase Project** (You already have this).
2.  **Resend Account**: Go to [Resend.com](https://resend.com) and sign up (it has a generous free tier).
    - Verify your domain (e.g., `founder.goldenbirdtech.com`) to send from an "Official Email".
    - Create an **API Key**.

## Step 1: Deploy the Edge Function

The code for the email function is located in `supabase/functions/send-waitlist-email/index.ts`.

To deploy it:

1.  Make sure you have the Supabase CLI installed.
2.  Login: `npx supabase login`
3.  Link your project: `npx supabase link --project-ref your-project-ref`
4.  Deploy:
    ```bash
    npx supabase functions deploy send-waitlist-email
    ```
5.  Set your Resend API Key in Supabase:
    ```bash
    npx supabase secrets set RESEND_API_KEY=re_123456789
    ```
    _Or go to Supabase Dashboard > Settings > Edge Functions > Secrets._

## Step 2: Set up Database Webhook

We want this function to run **automatically** whenever a new row is added to the `waitlist` table.

1.  Go to **Supabase Dashboard > Database > Webhooks**.
2.  Click **Create a new webhook**.
3.  **Name**: `send-welcome-email`
4.  **Table**: `public.waitlist`
5.  **Events**: Check `INSERT`.
6.  **Type**: `HTTP Request`.
7.  **Method**: `POST`.
8.  **URL**: URL of your deployed function (e.g., `https://<project-ref>.supabase.co/functions/v1/send-waitlist-email`).
    - _You can find this URL in the Edge Functions verification section._
9.  **HTTP Headers**:
    - Add `Authorization`: `Bearer <your-anon-key>` (if needed, usually not for internal webhooks if configured right, but check docs. Actually, Supabase Webhooks to Edge Functions are internal.)
    - _Better/Easier Way_: In the Webhook configuration, look for "Supabase Authentication" or just select "Edge Function" if that option appears (Supabase simplified this recently).
    - If using the generic HTTP Request: Ensure you select the correct function URL.

## Step 3: Verify Domain (Crucial for "Official Email")

In your Resend account settings, you MUST verify your domain (e.g., `founder.goldenbirdtech.com`).
Then, in `supabase/functions/send-waitlist-email/index.ts`, change Line 28:

```typescript
from: "FounderOS <anukalp@founder.goldenbirdtech.com>", // CHANGE THIS
```

to your actual verified email address.

---

**Now, when a user enters their email on your site:**

1.  Their email is saved to the `waitlist` table.
2.  The Webhook triggers the `send-waitlist-email` function.
3.  The function sends a beautiful HTML email via Resend.
