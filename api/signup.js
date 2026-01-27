import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req,res){
  try {
    if(req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' })

    const { email, password, username } = req.body
    if(!email || !password || !username) return res.status(400).json({ error:'All fields required' })

    // Create user in Supabase Auth
    const { data:user, error:authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if(authError) return res.status(400).json({ error: authError.message })

    // Insert into users table
    const { error:dbError } = await supabase.from('users').insert({
      auth_id: user.id,
      email,
      username,
      created_at: new Date()
    })
    if(dbError) return res.status(400).json({ error: dbError.message })

    return res.status(200).json({ message:'Signup successful', user })
  } catch(err) {
    return res.status(500).json({ error: err?.message || 'Server error' })
  }
}
