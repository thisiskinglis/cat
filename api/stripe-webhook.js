import Stripe from 'stripe';
import { Redis } from '@upstash/redis/cloudflare';

const ASSIGN_MEMBER_NUMBER = `
  local existing = redis.call('GET', KEYS[1])

  if existing then
    return existing
  end

  local nextNumber = redis.call('INCR', KEYS[2])
  local memberNo = string.format('%03d', nextNumber)

  redis.call('SET', KEYS[1], memberNo)

  return memberNo
`;

export default async function handleStripeWebhook(request, env) {
  if (request.method !== 'POST') {
    return new Response(
      'Method not allowed',
      { status: 405 }
    );
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

  // Stripe MUST receive the original raw request body
  // for webhook signature verification.
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

      if (customerId) {
        const redis = new Redis({
          url: env.KV_REST_API_URL,
          token: env.KV_REST_API_TOKEN,
        });

        /*
         * IMPORTANT:
         *
         * Test Stripe memberships and real memberships use
         * completely separate counters.
         *
         * This prevents our testing from consuming real
         * Crescita member numbers.
         */
        const prefix = event.livemode ? '' : 'test:';

        const memberKey =
          `${prefix}member:${customerId}`;

        const counterKey =
          `${prefix}member-counter`;

        /*
         * Run the check + increment + assignment atomically
         * inside Redis.
         *
         * This means two webhook requests cannot allocate
         * conflicting member numbers.
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
    }

    return Response.json({
      received: true,
    });
  } catch (err) {
    console.error(
      'Webhook processing failed:',
      err
    );

    /*
     * Returning 500 is deliberate.
     * Stripe can retry the webhook rather than us silently
     * losing the member assignment.
     */
    return new Response(
      'Webhook processing failed',
      { status: 500 }
    );
  }
}
