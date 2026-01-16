// ==========================
// /api/signup.js — Vercel Serverless Function
// Handles user signup via Supabase
// Always returns JSON — never plain text
// ==========================

import { createClient } from '@supabase/supabase-js';

// Read your Vercel environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Create user in Supabase Auth
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

    // Success
    return res.status(200).json({ message: 'Signup successful! Check your email to confirm.' });

  } catch (err) {
    // Catch-all server error
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
