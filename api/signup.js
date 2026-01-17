// File: api/signup.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // Log for debugging
    console.log('Supabase signup response:', { data, error });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Success
    return res.status(200).json({ data });
  } catch (err) {
    console.error('Signup API error:', err);
    // Send plain text if JSON fails
    return res.status(500).json({ error: err.message || String(err) });
  }
}
