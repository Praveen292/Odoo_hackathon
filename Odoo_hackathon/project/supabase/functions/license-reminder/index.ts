import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Missing server configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: drivers, error } = await supabase
      .from("drivers")
      .select("id, name, license_number, license_expiry, phone_number, status")
      .order("license_expiry", { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const now = new Date();
    const expiringSoon = (drivers ?? []).filter((d) => {
      const expiry = new Date(d.license_expiry);
      const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30 && diffDays >= -365;
    });

    const expired = (drivers ?? []).filter((d) => {
      const expiry = new Date(d.license_expiry);
      return expiry < now;
    });

    const emailBody = expiringSoon
      .map((d) => `- ${d.name} (License: ${d.license_number}) — Expires: ${d.license_expiry}`)
      .join("\n");

    if (expiringSoon.length > 0) {
      console.log(
        `[License Reminder] ${expiringSoon.length} driver(s) with licenses expiring within 30 days:\n${emailBody}`,
      );
    }
    if (expired.length > 0) {
      console.log(
        `[License Reminder] ${expired.length} driver(s) with already-expired licenses.`,
      );
    }

    const smtpUrl = Deno.env.get("SMTP_URL");
    if (smtpUrl && expiringSoon.length > 0) {
      // Nodemailer-compatible: in production, send via Nodemailer through an SMTP relay.
      // This is the integration point — the structure is in place.
      console.log(`[License Reminder] Would send email to fleet manager about ${expiringSoon.length} expiring licenses.`);
    }

    return new Response(
      JSON.stringify({
        expiringSoon: expiringSoon.map((d) => ({
          id: d.id,
          name: d.name,
          license_number: d.license_number,
          license_expiry: d.license_expiry,
          daysUntilExpiry: Math.ceil(
            (new Date(d.license_expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        })),
        expired: expired.map((d) => ({
          id: d.id,
          name: d.name,
          license_number: d.license_number,
          license_expiry: d.license_expiry,
        })),
        totalChecked: drivers?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
