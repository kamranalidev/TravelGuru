import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// (No dotenv import; Supabase Edge Functions provide env via Deno.env)

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SendBookingConfirmationBody = {
  booking_id: number;
};

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatMoney = (amountMinor: number, currency: string) => {
  const major = amountMinor / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(major);
};

const formatList = (value: unknown) => {
  if (!value) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value);
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing SERVICE_ROLE_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: SendBookingConfirmationBody;
    try {
      body = (await req.json()) as SendBookingConfirmationBody;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body?.booking_id || typeof body.booking_id !== "number") {
      return new Response(
        JSON.stringify({ error: "booking_id (number) is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is authenticated (we don't rely on RLS here; we do the ownership check manually)
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch booking and verify it belongs to the user
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, user_id, booking_date, departure_arrival_time, address, type, amount, currency, payment_intent_id, payment_status, package_id, service_id, adults, children, infants, adult_price, child_price, infant_price, services(name, location, service_description, service_type), packages(name, duration, includes, excludes, price)",
      )
      .eq("id", body.booking_id)
      .maybeSingle();

    if (bookingError) throw bookingError;

    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.payment_status !== "succeeded") {
      return new Response(JSON.stringify({ error: "Payment not succeeded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const to = user.email;
    if (!to) {
      return new Response(
        JSON.stringify({ error: "User email not available" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    type JoinedService = {
      name?: string | null;
      location?: string | null;
      service_description?: string | null;
      service_type?: string | null;
    };
    type JoinedPackage = {
      name?: string | null;
      duration?: string | null;
      includes?: string[] | null;
      excludes?: string[] | null;
      price?: number | null;
    };

    const rawServices = booking.services as
      | JoinedService
      | JoinedService[]
      | null
      | undefined;
    const rawPackages = (
      booking as { packages?: JoinedPackage | JoinedPackage[] | null }
    ).packages;

    const serviceRow: JoinedService | null = Array.isArray(rawServices)
      ? (rawServices[0] ?? null)
      : (rawServices ?? null);

    const packageRow: JoinedPackage | null = Array.isArray(rawPackages)
      ? (rawPackages[0] ?? null)
      : (rawPackages ?? null);

    const serviceName = serviceRow?.name ?? "Your booking";
    const location = serviceRow?.location ?? "";
    const packageName = packageRow?.name ?? "";
    const serviceDescription = serviceRow?.service_description ?? "";
    const serviceType = serviceRow?.service_type ?? "";
    const packageDuration = packageRow?.duration ?? "";
    const packageIncludes = formatList(packageRow?.includes);
    const packageExcludes = formatList(packageRow?.excludes);
    const packagePrice =
      typeof packageRow?.price === "number"
        ? formatMoney(packageRow.price, booking.currency ?? "aed")
        : "";

    const amountMinor = typeof booking.amount === "number" ? booking.amount : 0;
    const currency = (booking.currency ?? "aed") as string;

    // Participant info
    const adults =
      ((booking as Record<string, unknown>).adults as number | null) ?? 1;
    const children =
      ((booking as Record<string, unknown>).children as number | null) ?? 0;
    const infants =
      ((booking as Record<string, unknown>).infants as number | null) ?? 0;
    const totalGuests = adults + children + infants;

    let guestsHtml = "";
    if (totalGuests > 0) {
      const parts: string[] = [];
      if (adults > 0)
        parts.push(`👤 ${adults} Adult${adults !== 1 ? "s" : ""}`);
      if (children > 0)
        parts.push(`👦 ${children} Child${children !== 1 ? "ren" : ""}`);
      if (infants > 0)
        parts.push(`👶 ${infants} Infant${infants !== 1 ? "s" : ""}`);
      guestsHtml = `<p><strong>Guests:</strong> ${escapeHtml(parts.join(" · "))}${totalGuests > 1 ? ` (${totalGuests} total)` : ""}</p>`;
    }

    const subject = `Booking confirmed: ${serviceName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Booking Confirmed</h2>
        <p>Your payment was successful and your booking is confirmed.</p>
        <hr />
        <p><strong>Booking ID:</strong> ${escapeHtml(String(booking.id))}</p>
        <p><strong>Service:</strong> ${escapeHtml(serviceName)}</p>
        ${location ? `<p><strong>Location:</strong> ${escapeHtml(location)}</p>` : ""}
        ${serviceType ? `<p><strong>Service Type:</strong> ${escapeHtml(serviceType)}</p>` : ""}
        <p><strong>Date:</strong> ${escapeHtml(String(booking.booking_date))}</p>
        ${
          booking.departure_arrival_time
            ? `<p><strong>Time:</strong> ${escapeHtml(String(booking.departure_arrival_time))}</p>`
            : ""
        }
        ${booking.type ? `<p><strong>Booking Type:</strong> ${escapeHtml(String(booking.type))}</p>` : ""}
        ${booking.address ? `<p><strong>Address:</strong> ${escapeHtml(String(booking.address))}</p>` : ""}
        ${packageName ? `<p><strong>Package:</strong> ${escapeHtml(packageName)}</p>` : ""}
        ${packageDuration ? `<p><strong>Package Duration:</strong> ${escapeHtml(packageDuration)}</p>` : ""}
        ${packagePrice ? `<p><strong>Package Price:</strong> ${escapeHtml(packagePrice)}</p>` : ""}
        ${guestsHtml}
        <p><strong>Total:</strong> ${escapeHtml(formatMoney(amountMinor, currency))}</p>
        ${booking.payment_intent_id ? `<p><strong>Payment Intent:</strong> ${escapeHtml(String(booking.payment_intent_id))}</p>` : ""}
        ${
          serviceDescription || packageIncludes || packageExcludes
            ? `
        <hr />
        ${serviceDescription ? `<p><strong>Service Details:</strong> ${escapeHtml(serviceDescription)}</p>` : ""}
        ${packageIncludes ? `<p><strong>Includes:</strong> ${escapeHtml(packageIncludes)}</p>` : ""}
        ${packageExcludes ? `<p><strong>Excludes:</strong> ${escapeHtml(packageExcludes)}</p>` : ""}
        `
            : ""
        }
        <hr />
        <p>If you have questions, reply to this email.</p>
      </div>
    `;

    // Send using Supabase Auth email (not supported), so we use Supabase's built-in email provider via SMTP?
    // Supabase Edge Functions cannot send email by itself; use an external provider.
    // Here we use Resend if configured.

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom = Deno.env.get("EMAIL_FROM");

    if (!resendApiKey || !emailFrom) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          error: "Missing RESEND_API_KEY or EMAIL_FROM (email not sent)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to,
        subject,
        html,
      }),
    });

    const resendJson = await resendResp.json().catch(() => ({}));

    if (!resendResp.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email send failed",
          details: resendJson,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: resendJson?.id ?? undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send-booking-confirmation error:", message);

    return new Response(
      JSON.stringify({ error: "Server error", details: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
