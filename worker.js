import handleMember from './api/member.js';
import handleStripeWebhook from './api/stripe-webhook.js';
import handleExecutiveActivate from './api/executive-activate.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/member') {
      return handleMember(request, env);
    }

    if (url.pathname === '/api/stripe-webhook') {
      return handleStripeWebhook(request, env);
    }

    if (url.pathname === '/api/executive-activate') {
      return handleExecutiveActivate(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { error: 'API route not found' },
        { status: 404 }
      );
    }

    return env.ASSETS.fetch(request);
  },
};
