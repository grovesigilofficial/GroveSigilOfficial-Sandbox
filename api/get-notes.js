export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Missing server environment variables" });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/grove_notes?select=*&order=created_at.asc`,
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || "Failed to load notes"
      });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
