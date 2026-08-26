export default async function handleInitCounter(request, env) {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  if (!env.COUNTER_SETUP_KEY || suppliedKey !== env.COUNTER_SETUP_KEY) {
  return Response.json(
    {
      error: 'Unauthorized',
      headerPresent: Boolean(suppliedKey),
      headerLength: suppliedKey?.length ?? 0,
      envPresent: Boolean(env.COUNTER_SETUP_KEY),
      envLength: env.COUNTER_SETUP_KEY?.length ?? 0,
      matches: suppliedKey === env.COUNTER_SETUP_KEY
    },
    { status: 401 }
  );
}

  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    return Response.json(
      { error: 'Upstash variables missing in Cloudflare' },
      { status: 500 }
    );
  }

  const redisCommand = async (command) => {
    const response = await fetch(env.KV_REST_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `Upstash HTTP ${response.status}: ${text}`
      );
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid Upstash response: ${text}`);
    }

    if (data.error) {
      throw new Error(`Upstash error: ${data.error}`);
    }

    return data.result;
  };

  try {
    const existing = await redisCommand([
      'GET',
      'member-counter',
    ]);

    if (existing !== null && existing !== undefined) {
      return Response.json({
        changed: false,
        currentCounter: Number(existing),
        message: 'Counter already exists. Nothing was changed.',
      });
    }

    await redisCommand([
      'SET',
      'member-counter',
      '5',
    ]);

    const confirmed = await redisCommand([
      'GET',
      'member-counter',
    ]);

    return Response.json({
      changed: true,
      currentCounter: Number(confirmed),
      nextPaidMember: '006',
    });
  } catch (error) {
    console.error('Counter initialization failed:', error);

    return Response.json(
      {
        error: 'Counter initialization failed',
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
