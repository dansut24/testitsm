import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { reference, title, description, priority, category, submittedBy } = req.body;

  const msg = {
    to: "danieljamessutton18@outlook.com",
    from: "social@hi5tech.co.uk", // Use a verified sender
    subject: `New Incident Raised - ${reference}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1976d2">New Incident Raised</h2>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Submitted By:</strong> ${submittedBy}</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: "Email sent" });
  } catch (err) {
    console.error("SendGrid error:", err.response?.body || err.message);
    res.status(500).json({ error: "Failed to send email" });
  }
}
