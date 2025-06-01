
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, reference, title, description, priority, category, submittedBy, customerName } = req.body;

  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  const logoUrl = "https://hi5tech.co.uk/assets/logo.png";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1976d2; padding: 20px; text-align: center;">
        <img src="${logoUrl}" alt="Hi5Tech Logo" style="height: 40px; margin-bottom: 10px;" />
        <h1 style="color: #ffffff; margin: 0;">New ${capitalizedType} Submitted</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Customer:</strong> ${customerName || "N/A"}</p>
        <p><strong>Submitted By:</strong> ${submittedBy}</p>
      </div>
      <div style="background-color: #eeeeee; padding: 20px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">This is an automated notification from <strong>Hi5Tech ITSM</strong>.</p>
        <p style="margin: 8px 0 0;"><a href="https://hi5tech.co.uk" style="color: #1976d2;">Visit Website</a> | <a href="https://linkedin.com/company/hi5tech" style="color: #1976d2;">LinkedIn</a></p>
      </div>
    </div>
  `;

  const msg = {
    to: "danieljamessutton18@outlook.com",
    from: "danieljamessutton18@outlook.com",
    subject: `New ${capitalizedType} Raised - ${reference}`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    res.status(500).json({ error: "Email failed to send" });
  }
}
