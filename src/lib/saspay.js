import crypto from 'crypto';

const SASPAY_BASE_URL = process.env.SASPAY_BASE_URL || 'https://api.saspay.me/api/v1';
const SASPAY_SECRET_KEY = process.env.SASPAY_SECRET_KEY || '';
const SASPAY_WEBHOOK_SECRET = process.env.SASPAY_WEBHOOK_SECRET || '';
const SASPAY_CURRENCY = process.env.SASPAY_CURRENCY || 'XOF';
const SASPAY_FEE_MODE = process.env.SASPAY_FEE_MODE || 'ADD_ON';

/**
 * Creates a hosted checkout session on SasPay
 * Endpoint: POST /checkout-sessions/
 */
export async function createCheckoutSession({
  amount,
  currency = SASPAY_CURRENCY,
  description = 'Paiement Invitation Manager',
  customer_email,
  customer_name,
  customer_phone = '',
  country,
  return_url,
  metadata = {},
  fee_charge_mode = SASPAY_FEE_MODE,
}) {
  const secretKey = process.env.SASPAY_SECRET_KEY || SASPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SASPAY_SECRET_KEY is not configured in environment variables');
  }

  const payload = {
    amount: parseFloat(amount).toFixed(2),
    currency: currency || 'XOF',
    description,
    customer_email: customer_email || 'client@example.com',
    customer_name: customer_name || 'Client',
    customer_phone: customer_phone ? String(customer_phone).trim() : '',
    return_url,
    metadata,
  };

  if (country) {
    payload.country = country;
  }

  if (fee_charge_mode) {
    payload.fee_charge_mode = fee_charge_mode;
  }

  const response = await fetch(`${SASPAY_BASE_URL}/checkout-sessions/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('SasPay createCheckoutSession error:', data);
    const errorMsg = data?.message || data?.detail || JSON.stringify(data);
    throw new Error(`Erreur SasPay (${response.status}): ${errorMsg}`);
  }

  return data;
}

/**
 * Retrieves a checkout session by ID
 * Endpoint: GET /checkout-sessions/{id}/
 */
export async function getCheckoutSession(sessionId) {
  const secretKey = process.env.SASPAY_SECRET_KEY || SASPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SASPAY_SECRET_KEY is not configured');
  }

  const response = await fetch(`${SASPAY_BASE_URL}/checkout-sessions/${sessionId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('SasPay getCheckoutSession error:', data);
    throw new Error(data?.message || 'Erreur lors de la récupération de la session SasPay');
  }

  return data;
}

/**
 * Retrieves and verifies a transaction by ID
 * Endpoint: GET /payments/{id}/verify/ or GET /transactions/{id}/
 */
export async function verifyTransaction(transactionId) {
  const secretKey = process.env.SASPAY_SECRET_KEY || SASPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SASPAY_SECRET_KEY is not configured');
  }

  // Try /payments/{id}/verify/ first
  try {
    const res = await fetch(`${SASPAY_BASE_URL}/payments/${transactionId}/verify/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('SasPay payment verify failed, falling back to transactions API:', err?.message);
  }

  // Fallback to /transactions/{id}/
  const response = await fetch(`${SASPAY_BASE_URL}/transactions/${transactionId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('SasPay verifyTransaction error:', data);
    throw new Error(data?.message || 'Erreur vérification transaction SasPay');
  }

  return data;
}

/**
 * Validates a SasPay Webhook signature
 * According to official docs:
 * HMAC-SHA256 of `${timestampHeader}.${rawBody}` using SASPAY_WEBHOOK_SECRET
 * Checked with constant time comparison and 300s clock drift tolerance.
 */
export function verifySasPayWebhookSignature(rawBody, signatureHeader, timestampHeader) {
  const secret = process.env.SASPAY_WEBHOOK_SECRET || SASPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('SASPAY_WEBHOOK_SECRET is not defined');
    return false;
  }

  if (!signatureHeader || !timestampHeader) {
    console.warn('Missing SasPay webhook signature or timestamp headers');
    return false;
  }

  const TOLERANCE_SECONDS = 300; // 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestampHeader);

  if (isNaN(ts) || Math.abs(now - ts) > TOLERANCE_SECONDS) {
    console.warn(`SasPay webhook timestamp outside tolerance: diff=${Math.abs(now - ts)}s`);
    return false;
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${timestampHeader}.${rawBody}`)
      .digest('hex');

    const sigBuffer = Buffer.from(signatureHeader.trim().toLowerCase());
    const expectedBuffer = Buffer.from(expected.trim().toLowerCase());

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (err) {
    console.error('Error verifying SasPay webhook signature:', err);
    return false;
  }
}
