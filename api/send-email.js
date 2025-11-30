// /api/send-email.js
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const resend = new Resend(resendApiKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// 🔧 tweak this to your real hosted logo
const BRAND_LOGO_URL =
  "https://demoitsm-itsm.hi5tech.co.uk/logo192.png";

const BRAND_NAME = "Hi5Tech ITSM";
const BRAND_PRIMARY = "#1976d2"; // top bar / accents
const BRAND_BG = "#f4f6fb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body || {};

    // Basic required info
    const {
      to,
      subject: fallbackSubject,
      reference,
      title,
      description,
      priority,
      category,
      status,
      requester,
      submittedBy,
    } = payload;

    if (!to) {
      return res.status(400).json({ error: "Missing 'to' email address" });
    }

    // 1) Load incident_created template (or whichever you want)
    const { data: template, error: templateError } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("template_key", "incident_created")
      .maybeSingle();

    if (templateError) {
      console.error("Error fetching email template:", templateError);
    }

    const subject =
      template?.subject ||
      fallbackSubject ||
      (reference ? `New Incident Raised - ${reference}` : "New Incident Raised");

    // 2) Simple variable map for template replacement
    const vars = {
      reference: reference || "",
      title: title || "",
      description: description || "",
      priority: priority || "",
      category: category || "",
      status: status || "",
      requester: requester || "",
      submittedBy: submittedBy || "",
      brandName: BRAND_NAME,
    };

    // Replace {{variable}} in template body_html
    let bodyHtmlFromTemplate = template?.body_html || "";
    Object.entries(vars).forEach(([key, value]) => {
      const reg = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
      bodyHtmlFromTemplate = bodyHtmlFromTemplate.replace(reg, value);
    });

    // If no template is set, fall back to a simple body block
    if (!bodyHtmlFromTemplate) {
      bodyHtmlFromTemplate = `
        <p>Hi ${vars.requester || "there"},</p>
        <p>A new incident has been raised on your behalf.</p>
        ${
          vars.reference
            ? `<p><strong>Reference:</strong> ${vars.reference}</p>`
            : ""
        }
        ${
          vars.title
            ? `<p><strong>Title:</strong> ${vars.title}</p>`
            : ""
        }
        ${
          vars.description
            ? `<p><strong>Description:</strong><br>${vars.description}</p>`
            : ""
        }
        ${
          vars.priority
            ? `<p><strong>Priority:</strong> ${vars.priority}</p>`
            : ""
        }
        ${
          vars.category
            ? `<p><strong>Category:</strong> ${vars.category}</p>`
            : ""
        }
        ${
          vars.status
            ? `<p><strong>Status:</strong> ${vars.status}</p>`
            : ""
        }
        ${
          vars.submittedBy
            ? `<p><strong>Submitted by:</strong> ${vars.submittedBy}</p>`
            : ""
        }
        <p>We will keep you updated with further progress.</p>
      `;
    }

    // 3) Wrap in nice HTML layout
    const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${subject}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background: ${BRAND_BG};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #222;
    }
    .email-wrapper {
      width: 100%;
      background: ${BRAND_BG};
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }
    .email-header {
      background: ${BRAND_PRIMARY};
      color: #ffffff;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .email-header-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .email-header-logo img {
      max-width: 100%;
      max-height: 100%;
      display: block;
    }
    .email-header-text {
      display: flex;
      flex-direction: column;
    }
    .email-header-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }
    .email-header-subtitle {
      font-size: 11px;
      opacity: 0.9;
      margin: 2px 0 0;
    }
    .email-body {
      padding: 20px 20px 16px;
      font-size: 14px;
      line-height: 1.6;
    }
    .email-body h1,
    .email-body h2,
    .email-body h3 {
      margin-top: 0;
      color: #111827;
    }
    .email-body p {
      margin: 0 0 10px;
    }
    .email-meta {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      font-size: 12px;
    }
    .email-meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .email-meta-label {
      font-weight: 500;
      color: #4b5563;
    }
    .email-meta-value {
      color: #111827;
    }
    .email-footer {
      padding: 14px 20px 16px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
    .email-footer a {
      color: ${BRAND_PRIMARY};
      text-decoration: none;
    }
    .pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 500;
    }
    .pill-priority {
      background: #fee2e2;
      color: #b91c1c;
    }
    .pill-status {
      background: #dbeafe;
      color: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="email-header-logo">
          <img src="${BRAND_LOGO_URL}" alt="${BRAND_NAME} Logo" />
        </div>
        <div class="email-header-text">
          <p class="email-header-title">${BRAND_NAME}</p>
          <p class="email-header-subtitle">
            ${
              reference
                ? `Incident notification · Ref ${reference}`
                : "Incident notification"
            }
          </p>
        </div>
      </div>

      <div class="email-body">
        ${bodyHtmlFromTemplate}

        <div class="email-meta">
          ${
            reference
              ? `<div class="email-meta-row">
                  <span class="email-meta-label">Reference</span>
                  <span class="email-meta-value">${reference}</span>
                 </div>`
              : ""
          }
          ${
            title
              ? `<div class="email-meta-row">
                  <span class="email-meta-label">Title</span>
                  <span class="email-meta-value">${title}</span>
                 </div>`
              : ""
          }
          ${
            priority
              ? `<div class="email-meta-row">
                  <span class="email-meta-label">Priority</span>
                  <span class="email-meta-value">
                    <span class="pill pill-priority">${priority}</span>
                  </span>
                 </div>`
              : ""
          }
          ${
            status
              ? `<div class="email-meta-row">
                  <span class="email-meta-label">Status</span>
                  <span class="email-meta-value">
                    <span class="pill pill-status">${status}</span>
                  </span>
                 </div>`
              : ""
          }
          ${
            requester
              ? `<div class="email-meta-row">
                  <span class="email-meta-label">Requester</span>
                  <span class="email-meta-value">${requester}</span>
                 </div>`
              : ""
          }
          ${
            submittedBy
              ? `<div class="email-meta-row">
                  <span class="email-meta-label">Submitted by</span>
                  <span class="email-meta-value">${submittedBy}</span>
                 </div>`
              : ""
          }
        </div>
      </div>

      <div class="email-footer">
        <div>${BRAND_NAME} · Service Desk Notification</div>
        <div style="margin-top:4px;">
          This is an automated message. Please do not reply directly to this email.
        </div>
        <div style="margin-top:6px;">
          Need help? Visit your <a href="#">self-service portal</a>.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

    // Plain text fallback
    const text = `
${subject}

Reference: ${reference || "-"}
Title: ${title || "-"}
Description:
${description || "-"}

Priority: ${priority || "-"}
Category: ${category || "-"}
Status: ${status || "-"}

Requester: ${requester || "-"}
Submitted by: ${submittedBy || "-"}

This is an automated notification from ${BRAND_NAME}.
`;

    const { data: sendResult, error: sendError } = await resend.emails.send({
      from: `Service Desk <noreply@hi5tech.co.uk>`, // adjust domain to your Resend-approved from
      to,
      subject,
      html: finalHtml,
      text,
    });

    if (sendError) {
      console.error("Resend send error:", sendError);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true, id: sendResult?.id });
  } catch (err) {
    console.error("send-email handler error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
