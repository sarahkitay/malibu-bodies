export async function generateSquarePaymentLink(name: string, amount: number, currency = 'USD'): Promise<string> {
  const response = await fetch('/api/create-square-payment-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, amount, currency }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.details?.errors?.[0]?.detail || data?.error || 'Failed to generate Square payment link';
    throw new Error(message);
  }

  if (!data?.url) {
    throw new Error('Square link missing in server response');
  }

  return data.url as string;
}
