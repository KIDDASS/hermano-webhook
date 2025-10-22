export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the webhook type from the request
  const { webhookType, ...discordPayload } = req.body;
  
  // Choose the correct webhook based on type
  let DISCORD_WEBHOOK;
  if (webhookType === 'announcement') {
    DISCORD_WEBHOOK = process.env.ANNOUNCEMENT_WEBHOOK_URL;
  } else if (webhookType === 'security') {
    DISCORD_WEBHOOK = process.env.SECURITY_WEBHOOK_URL;
  } else {
    return res.status(400).json({ error: 'Invalid webhook type' });
  }

  if (!DISCORD_WEBHOOK) {
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Failed to send webhook' });
  }
}
