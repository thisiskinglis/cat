// Catches Stripe events. When a subscription checkout completes for the
// first time for a given customer, it assigns the next sequential member
// number and stores it in Upstash Redis, keyed by Stripe customer ID.
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

// Stripe needs the raw, untouched request body to verify the signature —
// so we turn off Vercel's automatic JSON body parsing for this route.
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = Redis.fromEnv();

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const signature = req.headers['stripe-signature'];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerId = session.customer;

    if (customerId) {
      // Only hand out a number the first time we see this customer —
      // renewals hit this same webhook event but shouldn't get a new one.
      const existing = await redis.get(`member:${customerId}`);
      if (!existing) {
        const nextNumber = await redis.incr('member-counter');
        const memberNo = String(nextNumber).padStart(3, '0');
        await redis.set(`member:${customerId}`, memberNo);
      }
    }
  }

  res.status(200).json({ received: true });
}
