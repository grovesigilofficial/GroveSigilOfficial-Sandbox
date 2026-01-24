export const config = {
  runtime: 'nodejs'
};

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const user = data.users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { error: delError } =
      await supabase.auth.admin.deleteUser(user.id);

    if (delError) {
      return res.status(500).json({ error: delError.message });
    }

    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
