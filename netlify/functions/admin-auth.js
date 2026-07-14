// netlify/functions/admin-auth.js
// Verifies the admin password server-side (it's never shipped to the browser)
// and issues a short-lived, HMAC-signed session token if correct. The token
// itself is what admin-orders.js checks on every request — this is what
// actually protects the orders endpoint, not just the login screen.

const crypto = require('crypto');

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is missing admin auth configuration' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (body.password !== adminPassword) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password' }) };
  }

  // Sign an expiry timestamp so admin-orders.js can verify this token later
  // without needing any shared session store — it just re-derives the same
  // signature and checks it matches, and that the expiry hasn't passed.
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const signature = crypto
    .createHmac('sha256', sessionSecret)
    .update(String(expiresAt))
    .digest('hex');
  const token = `${expiresAt}.${signature}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, expiresAt }),
  };
};
