import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token)
    return res.status(401).json({ error: 'No token' });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ error: 'Invalid token' });

  res.status(200).json({ user: data.user });
}
