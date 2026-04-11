export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://vltunwjftktmaaiicbny.supabase.co/rest/v1/grove_notes?select=*",
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const data = await response.json();

    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
