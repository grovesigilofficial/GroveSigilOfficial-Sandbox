import { createClient } from '@supabase/supabase-js'

// HARD-CODED KEYS (TEMP)
const supabase = createClient(
  "https://vltunwjftktmaaiicbny.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHVud2pmdGt0bWFhaWljY255Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0Njk2NCwiZXhwIjoyMDg0NzIyOTY0fQ.w8mT2Idl4KR5rq6BN8yhDWWWEIQqTXdi2ep4zaf-Srw"
)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const { email, password, username } = req.body
    if (!email || !password || !username) return res.status(400).json({ error: 'Missing fields' })

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (authError) return res.status(400).json({ error: authError.message })

    // Insert profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username
    })
    if (profileError) return res.status(400).json({ error: profileError.message })

    return res.status(200).json({ ok: true, userId: authData.user.id })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
