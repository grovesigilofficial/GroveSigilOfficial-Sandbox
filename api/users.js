import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (req.method === 'GET') {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(200).json({
        ok: true,
        userCount: data.users.length,
        emails: data.users.map(u => u.email),
      });
    }

    if (req.method === 'POST') {
      const { email } = req.body;
      if (!email) return res.status(400).json({ ok: false, error: 'Missing email' });

      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) return res.status(500).json({ ok: false, error: error.message });

      const user = data.users.find(u => u.email === email);
      if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) return res.status(500).json({ ok: false, error: delError.message });

      return res.status(200).json({ ok: true, message: 'User deleted' });
    }

    res.setHeader('Allow', ['GET','POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
