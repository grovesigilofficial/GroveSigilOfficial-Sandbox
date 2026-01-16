// File Path: /api/signup.js
// This runs on Vercel as a serverless function.
// It uses environment variables for your Supabase keys — NO hardcoding.

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ===== SAFE SUPABASE CLIENT =====
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY; 
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ===== CREATE USER =====
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Signup successful! Check your email to confirm.' });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
