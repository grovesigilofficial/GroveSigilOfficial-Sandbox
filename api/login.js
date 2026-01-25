import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if(error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: 'Login successful', user: { email: data.user?.email || email } });
  } catch(err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
