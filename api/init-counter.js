import { Redis } from '@upstash/redis/cloudflare';

export default async function handleInitCounter(request, env) {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  const suppliedKey = request.headers.get('x-setup-key');

  if (
    !env.COUNTER_SETUP_KEY ||
    suppliedKey !== env.COUNTER_SETUP_KEY
  ) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    return Response.json(
      { error: 'Upstash configuration missing' },
      { status: 500 }
    );
  }

  const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
  });

  try {
    const existing = await redis.get('member-counter');

    // Safety: never overwrite an existing counter.
    if (existing !== null && existing !== undefined) {
      return Response.json({
        changed: false,
        currentCounter: Number(existing),
        message: 'Counter already exists. Nothing was changed.',
      });
    }

    await redis.set('member-counter', 5);

    return Response.json({
      changed: true,
      currentCounter: 5,
      nextPaidMember: '006',
    });
  } catch (error) {
    console.error('Counter initialization failed:', error);

    return Response.json(
      { error: 'Counter initialization failed' },
      { status: 500 }
    );
  }
}
