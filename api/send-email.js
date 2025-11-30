// /api/send-email.js

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 🔒 Always send from this address
const FORCED_FROM = "noreply@hi5tech.co.uk";

// Simple template filler: replaces {{token}} with values from vars
function fillTemplate(template, vars) {
  if (!template) return "";
  let output = template;
  for (const [key, value] of Object.entries(vars || {})) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    output = output.replace(regex, value == null ? "" : String(value));
  }
  return output;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing");
    return res.status(500).json({ error: "Email service not configured" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase URL or Service Role key missing");
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const resend = new Resend(RESEND_API_KEY);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const {
      to,
      subject: subjectOverride,
      reference,
      title,
      description,
      priority,
      category,
      status,
      requester,
      submittedBy,
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: "Missing 'to' email address" });
    }

    // 🔎 Derive subdomain → tenant
    const host = req.headers.host || "";
    const rawSubdomain = host.split(".")[0] || "";
    const baseSubdomain = rawSubdomain.replace("-itsm", "");

    let tenant = null;
    let tenantSettings = null;
    let logoUrl = "";
    let tenantName = "Hi5Tech ITSM";

    try {
      // tenants table: subdomain → id, name
      const { data: tenantData, error: tenantErr } = await supabase
        .from("tenants")
        .select("id, name")
        .eq("subdomain", baseSubdomain)
        .maybeSingle();

      if (tenantErr) {
        console.warn("Tenant lookup error:", tenantErr.message);
      } else if (tenantData) {
        tenant = tenantData;
        tenantName = tenantData.name || tenantName;

        // tenant_settings: logo_url, primary_color, etc.
        const { data: settingsData, error: settingsErr } = await supabase
          .from("tenant_settings")
          .select("logo_url, primary_color")
          .eq("tenant_id", tenant.id)
          .maybeSingle();

        if (settingsErr) {
          console.warn("Tenant settings lookup error:", settingsErr.message);
        } else if (settingsData) {
          tenantSettings = settingsData;

          // tenant-logos bucket → public URL
          if (settingsData.logo_url) {
            const { data: publicData } = supabase.storage
              .from("tenant-logos")
              .getPublicUrl(settingsData.logo_url);

            if (publicData?.publicUrl) {
              logoUrl = publicData.publicUrl;
            }
          }
        }
      }
    } catch (lookupErr) {
      console.warn("Tenant/logo lookup failed:", lookupErr);
    }

    // 📧 Load email template from email_templates (if present)
    let subjectTemplate = "Incident {{reference}} - {{title}}";
    let htmlTemplate = "";
    let textTemplate = "";

    try {
      const { data: templateData, error: templateErr } = await supabase
        .from("email_templates")
        .select("subject_template, html_template, text_template")
        .eq("template_name", "incident_new")
        .maybeSingle();

      if (templateErr) {
        console.warn("Email template lookup error:", templateErr.message);
      } else if (templateData) {
        if (templateData.subject_template) {
          subjectTemplate = templateData.subject_template;
        }
        if (templateData.html_template) {
          htmlTemplate = templateData.html_template;
        }
        if (templateData.text_template) {
          textTemplate = templateData.text_template;
        }
      }
    } catch (tmplErr) {
      console.warn("Email template fetch failed:", tmplErr);
    }

    // 🧱 Fallback HTML template if DB entry is missing
    if (!htmlTemplate) {
      htmlTemplate = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Incident {{reference}}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background-color: #f4f5f7;
        margin: 0;
        padding: 0;
      }
      .wrapper {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px 16px;
      }
      .card {
        background: #ffffff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      }
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .logo {
        height: 32px;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        margin-left: 4px;
        background: #e3f2fd;
        color: #1976d2;
      }
      .meta {
        font-size: 13px;
        color: #555;
        margin-bottom: 12px;
      }
      .meta span {
        display: inline-block;
        margin-right: 12px;
      }
      .body {
        font-size: 14px;
        color: #333;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .footer {
        font-size: 12px;
        color: #888;
        border-top: 1px solid #eee;
        padding-top: 12px;
        margin-top: 8px;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          {{#ifLogo}}
            <img src="{{logoUrl}}" alt="{{tenantName}}" class="logo" />
          {{/ifLogo}}
          <div>
            <div><strong>{{tenantName}}</strong></div>
            <div style="font-size:12px;color:#777;">Service Desk Notification</div>
          </div>
        </div>

        <div class="meta">
          <span><strong>Incident:</strong> {{reference}}</span>
          <span><strong>Status:</strong> {{status}}</span>
          <span><strong>Priority:</strong> {{priority}}</span>
        </div>

        <div class="body">
          <p>Hi {{requester}},</p>
          <p>
            A new incident has been logged on your behalf by
            <strong>{{submittedBy}}</strong>.
          </p>
          <p>
            <strong>Title:</strong><br />
            {{title}}
          </p>
          <p>
            <strong>Description:</strong><br />
            {{description}}
          </p>
          <p>
            <strong>Category:</strong> {{category}}<br />
            <strong>Priority:</strong> {{priority}}<br />
            <strong>Status:</strong> {{status}}
          </p>
          <p>
            We will keep you updated on any progress or changes
            to this incident.
          </p>
        </div>

        <div class="footer">
          This email was sent from {{tenantName}} IT Service Management.<br />
          Please do not reply to this email address.
        </div>
      </div>
    </div>
  </body>
</html>
      `;
    }

    // Fallback plain text
    if (!textTemplate) {
      textTemplate = `
Incident {{reference}} - {{title}}

Requester: {{requester}}
Submitted by: {{submittedBy}}
Status: {{status}}
Priority: {{priority}}
Category: {{category}}

Description:
{{description}}

This email was sent from {{tenantName}} IT Service Management.
      `;
    }

    const vars = {
      reference: reference || "",
      title: title || "",
      description: description || "",
      priority: priority || "",
      category: category || "",
      status: status || "",
      requester: requester || "Customer",
      submittedBy: submittedBy || "Service Desk",
      tenantName,
      logoUrl,
    };

    // Replace custom {{#ifLogo}}…{{/ifLogo}} blocks
    const withLogoBlock = (tmpl) => {
      if (!tmpl.includes("{{#ifLogo}}")) return tmpl;
      if (logoUrl) {
        return tmpl
          .replace("{{#ifLogo}}", "")
          .replace("{{/ifLogo}}", "");
      }
      // strip the block entirely if no logo
      return tmpl.replace(/{{#ifLogo}}[\s\S]*?{{\/ifLogo}}/g, "");
    };

    const finalHtml = fillTemplate(withLogoBlock(htmlTemplate), vars);
    const finalText = fillTemplate(textTemplate, vars);

    const computedSubject = fillTemplate(subjectTemplate, vars);
    const subject =
      subjectOverride || computedSubject || "New Incident Raised";

    // 🔥 ALWAYS send from noreply@hi5tech.co.uk
    const fromEmail = FORCED_FROM;

    const { data, error: sendError } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: finalHtml,
      text: finalText,
    });

    if (sendError) {
      console.error("Resend send error:", sendError);
      return res
        .status(400)
        .json({ error: sendError.message || "Failed to send email" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("send-email handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
