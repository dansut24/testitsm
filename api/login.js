import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { email, password } = req.body;

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  // Set cookie for ALL subdomains
  res.setHeader(
    "Set-Cookie",
    `hi5tech_session=${data.session.access_token}; Path=/; Domain=.hi5tech.co.uk; HttpOnly; Secure; SameSite=Lax`
  );

  res.status(200).json({ ok: true });
}
