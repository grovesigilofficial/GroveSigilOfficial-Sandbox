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
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    // Fetch user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers({ filter: `email=eq.${email}` });
    if (listError) return res.status(400).json({ error: listError.message });
    if (!users || users.length === 0) return res.status(404).json({ error: 'User not found' });

    const userId = users[0].id;

    // Delete user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) return res.status(400).json({ error: deleteError.message });

    return res.status(200).json({ message: `User ${email} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
