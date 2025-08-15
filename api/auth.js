// /api/auth.js
export const config = { runtime: 'nodejs' };

// POST { code: string } -> { ok: true } if matches ACCESS_CODE
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const required = process.env.ACCESS_CODE;
    if (!required) return res.status(500).json({ error: 'Missing ACCESS_CODE env var' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body || '{}'); } catch {}
    }

    const { code } = body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing code' });
    }

    if (code === required) {
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: 'Invalid code' });
  } catch (e) {
    return res.status(500).json({ error: 'Unhandled error', detail: String(e) });
  }
}
