// /api/send-incident-email.js
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  const { title, description, reference, priority, category } = req.body;

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: 'support@yourcompany.com', // ✅ update with real recipient
      from: 'noreply@hi5tech.co.uk', // ✅ verified sender
      subject: `🚨 New Incident Raised: ${reference}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2 style="color: #295cb3;">New Incident Notification</h2>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Description:</strong><br>${description}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Category:</strong> ${category}</p>
          <hr/>
          <p style="font-size: 0.85em; color: #777;">Hi5Tech ITSM</p>
        </div>
      `
    };

    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
