import handleMember from './api/member.js';
import handleStripeWebhook from './api/stripe-webhook.js';
import handleExecutiveActivate from './api/executive-activate.js';
import handleInitCounter from './api/init-counter.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Retrieve an existing member number after Stripe checkout
    if (url.pathname === '/api/member') {
      return handleMember(request, env);
    }

    // Receive successful Stripe checkout events
    if (url.pathname === '/api/stripe-webhook') {
      return handleStripeWebhook(request, env);
    }

    // Activate executive memberships #001–#005
    if (url.pathname === '/api/executive-activate') {
      return handleExecutiveActivate(request, env);
    }

    // TEMPORARY: initialise the paid member counter at 5
    if (url.pathname === '/api/init-counter') {
      return handleInitCounter(request, env);
    }

    // Unknown API routes must not fall through to the React app
    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { error: 'API route not found' },
        { status: 404 }
      );
    }

    // Serve the React/Vite application
    return env.ASSETS.fetch(request);
  },
};
