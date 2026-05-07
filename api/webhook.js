// Vercel Serverless Function — Proxy to Make.com webhook
// This keeps the webhook URL hidden from the frontend code

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers (allow requests from our domains)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('MAKE_WEBHOOK_URL is not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const payload = {
      name:         req.body.name         || null,
      phone:        req.body.phone        || null,
      email:        req.body.email        || null,
      service:      req.body.service      || null,
      units:        req.body.units        || null,
      message:      req.body.message      || null,
      city:         req.body.city         || null,
      consent:      req.body.consent      || false,
      lead_type:    req.body.lead_type    || null,
      funnel:       req.body.funnel       || null,
      utm_source:   req.body.utm_source   || null,
      utm_medium:   req.body.utm_medium   || null,
      utm_campaign: req.body.utm_campaign || null,
      utm_term:     req.body.utm_term     || null,
      utm_content:  req.body.utm_content  || null,
      page_url:     req.body.page_url     || null,
      form_source:  req.body.form_source  || null,
      submitted_at: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Make webhook returned ${response.status}`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook proxy error:', error);
    return res.status(500).json({ error: 'Failed to forward to webhook' });
  }
}
