import { createClient } from '@supabase/supabase-js'

// HARD-CODED (DEBUG)
const supabase = createClient(
  "https://vltunwjftktmaaiicbny.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHVud2pmdGt0bWFhaWljY255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDY5NjQsImV4cCI6MjA4NDcyMjk2NH0.hQcnLrb7TgH37eek5FOlOgtwKfE2IlEWzxG35vzqS7Q"
)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      ok: true,
      user: data.user
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
