// netlify/functions/admin-orders.js
// Proxies requests to Shopify's Admin API so the access token never reaches the browser.
// Also requires a valid, signed session token (issued by admin-auth.js) on every
// request — without this, anyone who discovers this URL could fetch all order
// data directly, bypassing the login screen entirely.

const crypto = require('crypto');

const SHOPIFY_STORE_DOMAIN = 'outdoor-sports-travel.myshopify.com';
const API_VERSION = '2025-10';

function isValidToken(token, secret) {
  if (!token) return false;
  const [expiresAtStr, signature] = token.split('.');
  if (!expiresAtStr || !signature) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false; // expired

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(expiresAtStr)
    .digest('hex');

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length) return false; // timingSafeEqual requires equal length
  return crypto.timingSafeEqual(a, b);
}

exports.handler = async function (event) {
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing SHOPIFY_ADMIN_TOKEN' }),
    };
  }
  if (!sessionSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing ADMIN_SESSION_SECRET' }),
    };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!isValidToken(sessionToken, sessionSecret)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized — please log in again' }),
    };
  }

  const params = event.queryStringParameters || {};
  const query = new URLSearchParams();
  query.set('limit', params.limit || '250');
  query.set('status', params.status || 'any');
  if (params.created_at_min) query.set('created_at_min', params.created_at_min);
  if (params.created_at_max) query.set('created_at_max', params.created_at_max);

  try {
    const shopifyResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/orders.json?${query.toString()}`,
      {
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const body = await shopifyResponse.text();

    return {
      statusCode: shopifyResponse.status,
      headers: { 'Content-Type': 'application/json' },
      body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to reach Shopify Admin API' }),
    };
  }
};
