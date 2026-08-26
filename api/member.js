// Given a Stripe Checkout session_id (from the post-payment redirect URL),
// looks up which customer paid and returns their assigned member number.
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id: sessionId } = req.query;

  if (!sessionId) {
    res.status(400).json({ error: 'Missing session_id' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer;

    if (!customerId) {
      res.status(404).json({ error: 'No customer on this session' });
      return;
    }

    const memberNo = await kv.get(`member:${customerId}`);

    if (!memberNo) {
      // The webhook may not have finished processing yet — tell the
      // browser it's still pending so it can retry in a moment.
      res.status(202).json({ pending: true });
      return;
    }

    res.status(200).json({ memberNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not look up member number' });
  }
}
