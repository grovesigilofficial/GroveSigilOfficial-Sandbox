export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Missing server environment variables" });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/grove_notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify([
        {
          name: name || "Anonymous",
          message
        }
      ])
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || "Failed to send note"
      });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
