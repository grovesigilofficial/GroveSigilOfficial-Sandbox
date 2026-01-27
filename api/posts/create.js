import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Not logged in' })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })

    const { data: portalUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    const { error } = await supabase.from('posts').insert({
      user_id: portalUser.id,
      content
    })

    if (error) return res.status(400).json({ error: error.message })

    return res.status(200).json({ message: 'Post created' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
