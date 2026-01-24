import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Signup successful. Check email for confirmation.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
