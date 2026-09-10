/**
 * Vercel Serverless Function — OAuth2 Token Exchange para Discord Embedded App SDK
 * Rota: POST /api/token
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // ignore
    }
  }

  const code = body?.code;
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code in request body." });
  }

  const clientId = process.env.VITE_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: "VITE_DISCORD_CLIENT_ID ou DISCORD_CLIENT_SECRET nao configurados na Vercel."
    });
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: code
    });

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("[Discord OAuth2 Error]", data);
      return res.status(tokenResponse.status).json(data);
    }

    return res.status(200).json({ access_token: data.access_token });
  } catch (err) {
    console.error("[Discord OAuth2 Exception]", err);
    return res.status(500).json({ error: "Falha na comunicacao com Discord: " + err.message });
  }
}