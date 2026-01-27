import { createClient } from '@supabase/supabase-js'

// HARD-CODED (DEBUG)
const supabase = createClient(
  "https://vltunwjftktmaaiicbny.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHVud2pmdGt0bWFhaWljY255Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0Njk2NCwiZXhwIjoyMDg0NzIyOTY0fQ.w8mT2Idl4KR5rq6BN8yhDWWWEIQqTXdi2ep4zaf-Srw"
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

    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
