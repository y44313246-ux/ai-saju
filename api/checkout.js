/**
 * POST /api/checkout
 * 결제 세션을 만들고 결제창으로 보낼 정보를 돌려줍니다.
 *
 * 지금은 '시안' 단계라 결제 키가 없으면 503 PAYMENT_NOT_CONFIGURED 를 돌려주고,
 * 프런트엔드(app.js)는 그때 미리보기 모달을 띄웁니다.
 *
 * 지원: 토스페이먼츠(결제위젯/결제창) · 포트원(아임포트) V2 · Stripe Checkout
 */
const PRODUCTS = {
  year2026: { name: '2026 신년운세', amount: 19000 },
  deep: { name: '심층 사주 리포트', amount: 39000 },
  bundle: { name: '신년 + 심층 패키지', amount: 49000 }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { product: key } = req.body || {};
  const product = PRODUCTS[key];
  if (!product) return res.status(400).json({ error: 'UNKNOWN_PRODUCT' });

  const orderId = `saju_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    /* 1) 토스페이먼츠 — 클라이언트에서 결제창을 여는 방식 */
    if (process.env.TOSS_CLIENT_KEY && process.env.TOSS_SECRET_KEY) {
      return res.status(200).json({
        provider: 'toss',
        clientKey: process.env.TOSS_CLIENT_KEY,
        orderId,
        orderName: product.name,
        amount: product.amount,
        successUrl: `${origin}/payment/success?orderId=${orderId}`,
        failUrl: `${origin}/payment/fail?orderId=${orderId}`
      });
    }

    /* 2) 포트원(아임포트) V2 — 서버에서 결제를 준비하고 결제창 파라미터를 돌려주는 방식 */
    if (process.env.PORTONE_API_SECRET && process.env.PORTONE_STORE_ID) {
      const prep = await fetch('https://api.portone.io/payments/' + encodeURIComponent(orderId) + '/pre-register', {
        method: 'POST',
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ storeId: process.env.PORTONE_STORE_ID, amount: { total: product.amount } })
      });
      if (!prep.ok) throw new Error('portone-pre-register-failed');
      return res.status(200).json({
        provider: 'portone',
        storeId: process.env.PORTONE_STORE_ID,
        channelKey: process.env.PORTONE_CHANNEL_KEY,
        orderId,
        orderName: product.name,
        amount: product.amount
      });
    }

    /* 3) Stripe Checkout — 해외 결제용 */
    if (process.env.STRIPE_SECRET_KEY) {
      const params = new URLSearchParams({
        mode: 'payment',
        'line_items[0][price_data][currency]': 'krw',
        'line_items[0][price_data][product_data][name]': product.name,
        'line_items[0][price_data][unit_amount]': String(product.amount),
        'line_items[0][quantity]': '1',
        success_url: `${origin}/payment/success?orderId=${orderId}`,
        cancel_url: `${origin}/?canceled=1`,
        client_reference_id: orderId
      });
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });
      if (!r.ok) throw new Error('stripe-session-failed');
      const session = await r.json();
      return res.status(200).json({ provider: 'stripe', checkoutUrl: session.url, orderId });
    }

    return res.status(503).json({
      error: 'PAYMENT_NOT_CONFIGURED',
      message: '결제 키가 아직 설정되지 않았습니다. .env.example을 참고해 주세요.'
    });
  } catch (err) {
    return res.status(502).json({ error: 'PAYMENT_PROVIDER_ERROR', message: String(err.message || err) });
  }
}
