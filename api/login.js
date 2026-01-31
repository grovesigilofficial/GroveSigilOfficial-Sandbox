import { createClient } from '@supabase/supabase-js';
import cookie from 'cookie';

// HARD-CODED KEYS (TEMP)
const supabase = createClient(
  "https://vltunwjftktmaaiicbny.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NjkxNDY5NjQsImV4cCI6MjA4NDcyMjk2NH0.hQcnLrb7TgH37eek5FOlOgtwKfE2IlEWzxG35vzqS7Q"
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Set Supabase session cookie
    res.setHeader('Set-Cookie', cookie.serialize('supabase_session', data.session, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    }));

    return res.status(200).json({ ok: true, user: data.user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
