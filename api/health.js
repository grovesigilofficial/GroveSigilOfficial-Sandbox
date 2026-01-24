export default function handler(req, res) {
  if (!process.env.SUPABASE_URL) {
    return res.status(500).json({ error: "Missing SUPABASE_URL" });
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Missing SUPABASE_ANON_KEY" });
  }

  res.status(200).json({ ok: true });
}
