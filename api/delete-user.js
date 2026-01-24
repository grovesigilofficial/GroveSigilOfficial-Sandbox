// api/delete-user.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // List all users to find the target
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(400).json({ error: error.message });

    const user = data.users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Delete the user
    const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
    if (delError) return res.status(400).json({ error: delError.message });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
