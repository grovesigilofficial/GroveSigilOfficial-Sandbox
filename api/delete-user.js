import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req,res){
  try {
    if(req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' })

    const { email } = req.body
    if(!email) return res.status(400).json({ error:'Email required' })

    // Find user
    const { data:user, error:getError } = await supabase.from('users').select('auth_id').eq('email', email).single()
    if(getError) return res.status(400).json({ error: getError.message })

    // Delete from Auth
    const { error:authError } = await supabase.auth.admin.deleteUser(user.auth_id)
    if(authError) return res.status(400).json({ error: authError.message })

    // Delete from users table (cascade deletes profiles/posts)
    const { error:dbError } = await supabase.from('users').delete().eq('auth_id', user.auth_id)
    if(dbError) return res.status(400).json({ error: dbError.message })

    return res.status(200).json({ message:'User deleted' })
  } catch(err) {
    return res.status(500).json({ error: err?.message || 'Server error' })
  }
}
