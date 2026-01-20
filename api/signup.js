import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data, error } = await supabase.auth.signUp(
      { email, password },
      { redirectTo: 'https://grove-sigil-official-sandbox.vercel.app/pages/profile.html' }
    );

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: 'Signup successful! Check your email to confirm.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
