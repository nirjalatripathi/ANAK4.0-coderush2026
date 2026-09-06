const { AppError } = require('../middleware/errorMiddleware');

function config() {
  const env = String(process.env.KHALTI_ENV || 'sandbox').toLowerCase();
  const isTest = env !== 'production';
  const secretKey = process.env.KHALTI_SECRET_KEY || '';
  const initiateUrl = process.env.KHALTI_INITIATE_URL
    || (isTest
      ? 'https://dev.khalti.com/api/v2/epayment/initiate/'
      : 'https://khalti.com/api/v2/epayment/initiate/');
  const lookupUrl = process.env.KHALTI_LOOKUP_URL
    || (isTest
      ? 'https://dev.khalti.com/api/v2/epayment/lookup/'
      : 'https://khalti.com/api/v2/epayment/lookup/');
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const sandboxFallback = isTest && String(process.env.KHALTI_SANDBOX_FALLBACK || 'true') !== 'false';
  return { env, isTest, secretKey, initiateUrl, lookupUrl, clientUrl, sandboxFallback };
}

function sandboxFallbackEnabled() {
  return config().sandboxFallback;
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function toPaisa(amountNPR) {
  return Math.round(Number(amountNPR) * 100);
}

function fromPaisa(paisa) {
  return Number((Number(paisa || 0) / 100).toFixed(2));
}

function mapStatus(raw) {
  const status = String(raw || '').trim();
  const table = {
    Completed: 'COMPLETE',
    Pending: 'PENDING',
    Initiated: 'PENDING',
    Expired: 'FAILED',
    Failed: 'FAILED',
    'User canceled': 'CANCELED',
    'User cancelled': 'CANCELED',
    Refunded: 'FULL_REFUND',
    'Partially refunded': 'PARTIAL_REFUND',
    'Partially Refunded': 'PARTIAL_REFUND',
  };
  return table[status] || (status ? 'AMBIGUOUS' : 'UNAVAILABLE');
}

async function khaltiFetch(url, payload) {
  const { secretKey } = config();
  if (!secretKey) throw new AppError('KHALTI_SECRET_KEY is not configured on the server.', 500);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Key ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function initiatePayment({
  amountNPR,
  purchaseOrderId,
  purchaseOrderName,
  donorName,
  donorEmail,
  donorPhone,
}) {
  const { initiateUrl, clientUrl, isTest } = config();
  const amount = toPaisa(amountNPR);
  if (!Number.isFinite(amount) || amount < 1000) {
    throw new AppError('Enter a valid amount of at least NPR 10.00', 400);
  }

  const { response, body } = await khaltiFetch(initiateUrl, {
    return_url: `${clientUrl}/donate/khalti/success`,
    website_url: `${clientUrl}/`,
    amount,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: purchaseOrderName || 'RAHAT relief donation',
    customer_info: {
      name: donorName || 'RAHAT donor',
      ...(donorEmail ? { email: donorEmail } : {}),
      ...(donorPhone ? { phone: donorPhone } : {}),
    },
    merchant_extra: purchaseOrderId,
  });

  if (!response.ok || !body.pidx || !body.payment_url) {
    const detail = body.detail || body.error_key || body.message || `HTTP ${response.status}`;
    console.log(`Khalti initiate failed status=${response.status} detail=${String(detail).slice(0, 180)}`);
    throw new AppError(
      response.status === 401
        ? 'Khalti rejected the merchant key. Check KHALTI_SECRET_KEY against your test-admin.khalti.com account.'
        : `Khalti could not start checkout. ${typeof detail === 'string' ? detail : 'Please try again.'}`,
      response.status === 401 ? 502 : 502
    );
  }

  return {
    pidx: body.pidx,
    paymentUrl: body.payment_url,
    expiresAt: body.expires_at || '',
    environment: isTest ? 'sandbox' : 'production',
    sandboxFallback: sandboxFallbackEnabled(),
  };
}

async function lookupPayment(pidx) {
  const { lookupUrl } = config();
  if (!pidx) return { ok: false, status: 'UNAVAILABLE', raw: 'Initiated', txnId: '', amountPaisa: 0, body: {} };
  try {
    const { response, body } = await khaltiFetch(lookupUrl, { pidx });
    if (body.detail === 'Not found.' || (body.error_key === 'validation_error' && !body.status)) {
      return { ok: false, status: 'NOT_FOUND', raw: 'Not found', txnId: '', amountPaisa: 0, body };
    }
    if (!response.ok && !body.status) {
      return { ok: false, status: 'UNAVAILABLE', raw: body.detail || 'UNAVAILABLE', txnId: '', amountPaisa: 0, body };
    }
    const status = mapStatus(body.status);
    return {
      ok: status === 'COMPLETE',
      status,
      raw: body.status || '',
      txnId: body.transaction_id || '',
      amountPaisa: Number(body.total_amount || 0),
      body,
    };
  } catch {
    return { ok: false, status: 'UNAVAILABLE', raw: 'UNAVAILABLE', txnId: '', amountPaisa: 0, body: {} };
  }
}

module.exports = {
  config,
  money,
  toPaisa,
  fromPaisa,
  mapStatus,
  sandboxFallbackEnabled,
  initiatePayment,
  lookupPayment,
};
