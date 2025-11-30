// /api/send-incident-email.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      reference,
      title,
      description,
      priority,
      category,
      status,
      requesterEmail,
      requesterName,
    } = req.body || {};

    if (!reference || !requesterEmail) {
      return res.status(400).json({
        error: "reference and requesterEmail are required",
      });
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "no-reply@hi5tech.co.uk";

    const subject = `New Incident Raised – ${reference}`;
    const previewText = `Incident ${reference} (${priority || "Unspecified"} priority) has been raised.`;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 4px;">New Incident Raised</h2>
        <p style="margin-top: 0; color: #6B7280;">Reference: <strong>${reference}</strong></p>
        <hr style="border:none;border-top:1px solid #E5E7EB;margin: 12px 0;" />
        
        <p><strong>Title:</strong> ${title || "No title provided"}</p>
        <p><strong>Description:</strong><br/>${(description || "")
          .replace(/\n/g, "<br/>")}</p>
        
        <p><strong>Category:</strong> ${category || "Not set"}</p>
        <p><strong>Priority:</strong> ${priority || "Not set"}</p>
        <p><strong>Status:</strong> ${status || "New"}</p>

        <p><strong>Requester:</strong> ${
          requesterName ? `${requesterName} &lt;${requesterEmail}&gt;` : requesterEmail
        }</p>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin: 16px 0;" />

        <p style="font-size: 12px; color: #9CA3AF;">
          This incident was created via the Hi5Tech ITSM portal.
        </p>
      </div>
    `;

    // Send to requester
    await resend.emails.send({
      from: fromEmail,
      to: requesterEmail,
      subject,
      html,
      text: previewText,
    });

    // Optionally also send to your IT team inbox
    const itInbox = process.env.ITSM_TEAM_EMAIL;
    if (itInbox) {
      await resend.emails.send({
        from: fromEmail,
        to: itInbox,
        subject: `[ITSM] ${subject}`,
        html,
        text: previewText,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({
      error: "Failed to send incident email",
      details: err?.message || err,
    });
  }
};
