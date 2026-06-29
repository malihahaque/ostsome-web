// netlify/functions/admin-orders.js
// Proxies requests to Shopify's Admin API so the access token never reaches the browser.

const SHOPIFY_STORE_DOMAIN = 'outdoor-sports-travel.myshopify.com';
const API_VERSION = '2024-04';

exports.handler = async function (event) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing SHOPIFY_ADMIN_TOKEN' }),
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
          'X-Shopify-Access-Token': token,
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
