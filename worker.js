import handleMember from './api/member.js';
import handleStripeWebhook from './api/stripe-webhook.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Look up a customer's member number after Stripe redirects them back.
    if (url.pathname === '/api/member') {
      return handleMember(request, env);
    }

    // Receive Stripe checkout events and allocate member numbers.
    if (url.pathname === '/api/stripe-webhook') {
      return handleStripeWebhook(request, env);
    }

    // Never let an unknown API route accidentally return the React app.
    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { error: 'API route not found' },
        { status: 404 }
      );
    }

    // Everything else is the Crescita React app.
    return env.ASSETS.fetch(request);
  },
};
