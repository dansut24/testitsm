// /api/sendgrid.js

import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * API handler to send email notifications via SendGrid
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  try {
    await sendgrid.send({
      to,
      from: "danieljamessutton18@outlook.com", // Must be a verified sender in SendGrid
      subject,
      html,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
