import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('content, created_at, users(username)')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return res.status(400).json({ error: error.message })

    return res.status(200).json({ posts: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
