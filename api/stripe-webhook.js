import Stripe from 'stripe';
import { Redis } from '@upstash/redis/cloudflare';

/*
 * Atomically assigns one permanent member number per Stripe customer.
 *
 * 001-005 are reserved for executives.
 * If no paid-member counter exists yet, Redis is automatically seeded
 * at 5 so the first paying member receives 006.
 */
const ASSIGN_MEMBER_NUMBER = `
  local existing = redis.call('GET', KEYS[1])

  if existing then
    return existing
  end

  local current = redis.call('GET', KEYS[2])
  local currentNumber = tonumber(current or '0')

  if not currentNumber or currentNumber < 5 then
    redis.call('SET', KEYS[2], 5)
  end

  local nextNumber = redis.call('INCR', KEYS[2])
  local memberNo = string.format('%03d', nextNumber)

  redis.call('SET', KEYS[1], memberNo)

  return memberNo
`;

export default async function handleStripeWebhook(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (
    !env.STRIPE_SECRET_KEY ||
    !env.STRIPE_WEBHOOK_SECRET ||
    !env.KV_REST_API_URL ||
    !env.KV_REST_API_TOKEN
  ) {
    console.error('Missing Stripe or Upstash environment variables');

    return new Response(
      'Server configuration error',
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      'Missing Stripe signature',
      { status: 400 }
    );
  }

  // Stripe signature verification requires the exact raw request body.
  const rawBody = await request.text();

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error(
      'Webhook signature verification failed:',
      err.message
    );

    return new Response(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;

      if (!customerId) {
        console.error(
          'Completed Checkout Session has no Stripe customer ID'
        );

        return new Response(
          'Checkout session has no customer',
          { status: 400 }
        );
      }

      const redis = new Redis({
        url: env.KV_REST_API_URL,
        token: env.KV_REST_API_TOKEN,
      });

      /*
       * Keep Stripe test numbering separate from live numbering.
       */
      const prefix = event.livemode ? '' : 'test:';

      const memberKey = `${prefix}member:${customerId}`;
      const counterKey = `${prefix}member-counter`;

      /*
       * Atomic Redis operation:
       *
       * - existing member gets same number
       * - reserve 001-005
       * - first paid member gets 006
       * - duplicate Stripe webhooks do not consume another number
       */
      const memberNo = await redis.eval(
        ASSIGN_MEMBER_NUMBER,
        [memberKey, counterKey],
        []
      );

      console.log(
        `Member ${memberNo} assigned to ${customerId}`
      );
    }

    return Response.json({
      received: true,
    });
  } catch (err) {
    console.error(
      'Webhook processing failed:',
      err
    );

    return new Response(
      'Webhook processing failed',
      { status: 500 }
    );
  }
}
