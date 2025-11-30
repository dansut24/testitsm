// /api/send-email.js
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// These should be set as *server-side* env vars in Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Very simple mustache-style replacer: {{key}}
function applyTemplate(str, context = {}) {
  if (!str) return "";
  return str.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    const value = context[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      type,              // e.g. "incident"
      templateKey,       // e.g. "incident_created" (optional)
      recipientEmail,    // where to send
      subject,           // fallback subject
      // arbitrary payload for template context:
      reference,
      title,
      description,
      priority,
      category,
      status,
      requester,
      submittedBy,
      ...rest           // extra fields if needed later
    } = req.body || {};

    if (!recipientEmail) {
      return res.status(400).json({ error: "recipientEmail is required" });
    }

    // 1) Determine which template to load
    const key = templateKey || `${type || "generic"}_created`;

    // 2) Try to load from email_templates
    let template = null;
    const { data, error: tplError } = await supabase
      .from("email_templates")
      .select("subject, body_html")
      .eq("key", key)
      .maybeSingle();

    if (tplError) {
      console.error("Error loading email template:", tplError);
    } else if (data) {
      template = data;
    }

    // 3) Build context for placeholder replacement
    const context = {
      type,
      reference,
      title,
      description,
      priority,
      category,
      status,
      requester,
      submittedBy,
      ...rest,
    };

    // 4) Subject + HTML with fallback if no template
    const finalSubject = template
      ? applyTemplate(template.subject, context)
      : subject || `New ${type || "notification"} - ${reference || ""}`;

    const fallbackHtml = `
      <h2>${finalSubject}</h2>
      <p><strong>Reference:</strong> ${reference || ""}</p>
      <p><strong>Title:</strong> ${title || ""}</p>
      <p><strong>Description:</strong><br/>${(description || "").replace(
        /\n/g,
        "<br/>"
      )}</p>
      <p><strong>Priority:</strong> ${priority || ""}</p>
      <p><strong>Category:</strong> ${category || ""}</p>
      <p><strong>Status:</strong> ${status || ""}</p>
      <p><strong>Requester:</strong> ${requester || ""}</p>
      <p><strong>Submitted by:</strong> ${submittedBy || ""}</p>
    `;

    const finalHtml = template
      ? applyTemplate(template.body_html, context)
      : fallbackHtml;

    // 5) Send via Resend
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "ITSM <no-reply@your-verified-domain.com>", // 🔁 change to your Resend domain
      to: [recipientEmail],
      subject: finalSubject,
      html: finalHtml,
    });

    if (sendError) {
      console.error("Resend send error:", sendError);
      return res
        .status(500)
        .json({ error: "Failed to send email", details: sendError });
    }

    return res.status(200).json({ success: true, id: sendData?.id || null });
  } catch (err) {
    console.error("Email handler error:", err);
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message || String(err),
    });
  }
}
