import { randomUUID } from 'node:crypto';

type Req = {
  method?: string;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = (process.env.SQUARE_ENVIRONMENT || 'production').toLowerCase();
  const defaultCurrency = (process.env.SQUARE_CURRENCY || 'USD').toUpperCase();
  const redirectUrl = process.env.SQUARE_REDIRECT_URL;

  if (!accessToken || !locationId) {
    res.status(500).json({ error: 'Square is not configured on the server' });
    return;
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
      | { name?: string; amount?: number | string; currency?: string }
      | undefined;

    const name = (body?.name || 'Malibu Bodies Package').trim();
    const amount = Number(body?.amount);
    const currency = (body?.currency || defaultCurrency).toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const payload: Record<string, unknown> = {
      idempotency_key: randomUUID(),
      quick_pay: {
        name,
        location_id: locationId,
        price_money: {
          amount: Math.round(amount * 100),
          currency,
        },
      },
    };

    if (redirectUrl) {
      payload.checkout_options = { redirect_url: redirectUrl };
    }

    const baseUrl =
      environment === 'sandbox'
        ? 'https://connect.squareupsandbox.com'
        : 'https://connect.squareup.com';

    const squareResponse = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2026-02-18',
      },
      body: JSON.stringify(payload),
    });

    const squareJson = await squareResponse.json();

    if (!squareResponse.ok) {
      res.status(squareResponse.status).json({
        error: 'Square API request failed',
        details: squareJson,
      });
      return;
    }

    const url = squareJson?.payment_link?.url;
    const id = squareJson?.payment_link?.id;

    if (!url) {
      res.status(500).json({ error: 'Square did not return a payment link', details: squareJson });
      return;
    }

    res.status(200).json({ url, id });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to create Square payment link',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
