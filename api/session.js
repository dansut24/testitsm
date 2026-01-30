import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const token = req.cookies.hi5tech_session;
  if (!token) return res.status(401).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error) return res.status(401).end();

  res.json({ user: data.user });
}
