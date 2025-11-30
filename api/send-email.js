// /api/send-email.js
const { Resend } = require("resend");

// Make sure RESEND_API_KEY is set in Vercel → Project → Settings → Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      to,
      subject,
      reference,
      title,
      description,
      priority,
      category,
      status,
      requester,
      submittedBy,
    } = body || {};

    if (!to) {
      return res.status(400).json({ error: "Missing 'to' email address" });
    }

    const safeSubject =
      subject || `New Incident Raised${reference ? ` - ${reference}` : ""}`;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827;">
        <h2 style="margin-bottom: 4px;">New Incident Raised</h2>
        ${
          reference
            ? `<p style="margin: 0 0 12px 0; color: #6b7280;">Reference: <strong>${reference}</strong></p>`
            : ""
        }

        <p style="margin: 0 0 8px 0;">
          Hi ${requester || "there"},
        </p>

        <p style="margin: 0 0 12px 0;">
          A new incident has been logged on your behalf in the Hi5Tech ITSM portal.
        </p>

        <table style="border-collapse: collapse; margin-bottom: 16px;">
          <tbody>
            ${
              title
                ? `<tr>
                    <td style="padding: 4px 8px; font-weight: 600;">Title</td>
                    <td style="padding: 4px 8px;">${title}</td>
                  </tr>`
                : ""
            }
            ${
              description
                ? `<tr>
                    <td style="padding: 4px 8px; font-weight: 600;">Description</td>
                    <td style="padding: 4px 8px;">${description}</td>
                  </tr>`
                : ""
            }
            ${
              category
                ? `<tr>
                    <td style="padding: 4px 8px; font-weight: 600;">Category</td>
                    <td style="padding: 4px 8px;">${category}</td>
                  </tr>`
                : ""
            }
            ${
              priority
                ? `<tr>
                    <td style="padding: 4px 8px; font-weight: 600;">Priority</td>
                    <td style="padding: 4px 8px;">${priority}</td>
                  </tr>`
                : ""
            }
            ${
              status
                ? `<tr>
                    <td style="padding: 4px 8px; font-weight: 600;">Status</td>
                    <td style="padding: 4px 8px;">${status}</td>
                  </tr>`
                : ""
            }
            ${
              submittedBy
                ? `<tr>
                    <td style="padding: 4px 8px; font-weight: 600;">Logged By</td>
                    <td style="padding: 4px 8px;">${submittedBy}</td>
                  </tr>`
                : ""
            }
          </tbody>
        </table>

        <p style="margin: 0 0 8px 0;">
          You can view and track this incident in your ITSM portal.
        </p>

        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          This is an automated notification from Hi5Tech ITSM.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Hi5Tech ITSM <noreply@hi5tech.co.uk>", // 🔴 change to your verified sender
      to,
      subject: safeSubject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message || "Resend failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-email handler error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Unexpected server error" });
  }
};
