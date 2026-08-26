import Stripe from 'stripe';
import { Redis } from '@upstash/redis/cloudflare';

export default async function handleMember(request, env) {
  if (request.method !== 'GET') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return Response.json(
      { error: 'Missing session_id' },
      { status: 400 }
    );
  }

  if (
    !env.STRIPE_SECRET_KEY ||
    !env.KV_REST_API_URL ||
    !env.KV_REST_API_TOKEN
  ) {
    console.error('Missing Stripe or Upstash environment variables');

    return Response.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

    if (!customerId) {
      return Response.json(
        { error: 'No customer on this session' },
        { status: 404 }
      );
    }

    // Keep Stripe TEST members completely separate from LIVE members.
    const prefix = session.livemode ? '' : 'test:';

    const memberNo = await redis.get(
      `${prefix}member:${customerId}`
    );

    if (!memberNo) {
      // Stripe webhook may still be processing.
      // Your React app already retries this automatically.
      return Response.json(
        { pending: true },
        { status: 202 }
      );
    }

    return Response.json(
      { memberNo: String(memberNo) },
      { status: 200 }
    );
  } catch (err) {
    console.error('Member lookup failed:', err);

    return Response.json(
      { error: 'Could not look up member number' },
      { status: 500 }
    );
  }
}
