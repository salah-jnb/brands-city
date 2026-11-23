// Fonction serverless Vercel : envoie une notification Web Push aux appareils admin.
// Appelée uniquement par la base Supabase (pg_net) quand une commande est passée.
// Variables d'environnement Vercel requises : VAPID_PRIVATE_KEY, WEBHOOK_SECRET
// (optionnelles : VAPID_PUBLIC_KEY, VAPID_SUBJECT).
import { setVapidDetails, sendNotification } from 'web-push';
import { timingSafeEqual } from 'node:crypto';

const DEFAULT_PUBLIC_KEY =
  'BANaHPqGj_bkCLTTjTaEIi-dnD-6ry0SICqSiZuR1OiVGqL-iVgngZrK_VCItv3AkagIq-J__T1W76YhXNX7Az0';
const MAX_SUBSCRIPTIONS = 50;

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

const isValidSubscription = (s) =>
  s &&
  typeof s.endpoint === 'string' &&
  s.endpoint.startsWith('https://') &&
  s.keys &&
  typeof s.keys.p256dh === 'string' &&
  typeof s.keys.auth === 'string';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const secret = process.env.WEBHOOK_SECRET;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!secret || !privateKey) {
    return res.status(500).json({ error: 'not_configured' });
  }
  if (!safeEqual(req.headers['x-webhook-secret'] ?? '', secret)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const subscriptions = Array.isArray(body.subscriptions)
    ? body.subscriptions.filter(isValidSubscription).slice(0, MAX_SUBSCRIPTIONS)
    : [];
  if (subscriptions.length === 0) {
    return res.status(200).json({ sent: 0, failed: 0, expired: [] });
  }

  // Le contenu est reconstruit ici à partir de valeurs numériques uniquement
  const orderId = Number(body.orderId) || 0;
  const items = Number(body.items) || 0;
  const total = Number(body.total) || 0;
  const payload = JSON.stringify({
    title: 'Nouvelle commande !',
    body: `Commande #${orderId} · ${items} article${items > 1 ? 's' : ''} · ${total.toFixed(2)} DT`,
    url: '/admin/orders',
    tag: `order-${orderId}`,
  });

  setVapidDetails(
    process.env.VAPID_SUBJECT || 'https://brands-city.vercel.app',
    process.env.VAPID_PUBLIC_KEY || DEFAULT_PUBLIC_KEY,
    privateKey
  );

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendNotification(sub, payload, { TTL: 3600, urgency: 'high' }))
  );

  const expired = [];
  let sent = 0;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      sent += 1;
    } else if (r.reason && (r.reason.statusCode === 404 || r.reason.statusCode === 410)) {
      expired.push(subscriptions[i].endpoint);
    }
  });

  return res.status(200).json({ sent, failed: results.length - sent, expired });
}
