// Follow this setup guide to integrate the "Official Email"
// 1. Get an API Key from https://resend.com
// 2. Set it in Supabase Dashboard > Settings > Edge Functions > Secrets > Add "RESEND_API_KEY"
// 3. Deploy this function: `supabase functions deploy send-waitlist-email`



const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const { record } = await req.json();
    const email = record.email;

    if (!email) {
      return new Response("No email found", { status: 400 });
    }

    console.log(`Sending welcome email to ${email}`);

    // Call Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FounderOS <anukalp@founder.goldenbirdtech.com>", // replace with verified domain
to: [email],
subject: "You're In. Welcome to the FounderOS Waitlist 🚀",
html: `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">

    <h1 style="margin-bottom: 12px;">Welcome to the future of founding.</h1>

    <p>Hi,</p>

    <p>
      You’ve successfully joined the <strong>FounderOS</strong> waitlist.
    </p>

    <p>
      We’re building an <strong>Autonomous AI Co-Founder</strong> designed to take over the work that slows founders down —
      operations, execution, and day-to-day decisions — so you can focus on what actually matters.
    </p>

    <p>
      Your spot is secured. As we roll out access in batches, you’ll be among the first to know when FounderOS is ready for you.
    </p>

    <p>
      Over the coming weeks, we’ll share early updates, behind-the-scenes progress, and what to expect from your AI co-founder.
    </p>

    <br/>

    <p>
      Until then, keep building.<br/>
      We’ll handle the rest — soon.
    </p>

    <br/>

    <!-- Signature Block -->
    <table style="margin-top: 32px; border-top: 1px solid #eee; padding-top: 20px;">
      <tr>
        <td style="vertical-align: top; padding-right: 16px;">
          <img 
            src="https://www.goldenbirdtech.com/lovable-uploads/logo.png" 
            alt="The Goldenbird" 
            width="48" 
            height="48" 
            style="border-radius: 8px;"
          />
        </td>

        <td style="vertical-align: top;">
          <p style="margin: 0; font-weight: 600; font-size: 15px;">
            Anukalp Dwivedi
          </p>

          <p style="margin: 4px 0 8px 0; font-size: 13px; color: #555;">
            Founder, The Goldenbird
          </p>

          <p style="margin: 0; font-size: 13px;">
            <a 
              href="https://www.linkedin.com/in/anukalp-dwivedi" 
              style="color: #0a66c2; text-decoration: none;"
              target="_blank"
            >
              LinkedIn
            </a>
            &nbsp;•&nbsp;
            <a 
              href="https://www.goldenbirdtech.com" 
              style="color: #0a66c2; text-decoration: none;"
              target="_blank"
            >
              goldenbirdtech.com
            </a>
          </p>
        </td>
      </tr>
    </table>

  </div>
`,

      }),
    });

    const data = await res.json();
    console.log(data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Deno.serve is built-in
Deno.serve(handler);
