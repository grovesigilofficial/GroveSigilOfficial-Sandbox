import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Not logged in' })

    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return res.status(401).json({ error: 'Invalid session' })

    const { data: profile } = await supabase
      .from('users')
      .select('email, username')
      .eq('auth_id', user.id)
      .single()

    return res.status(200).json({ user: profile })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
