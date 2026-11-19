/**
 * POST /api/reading
 * 명식 + 상품 → 심층 리포트 본문(JSON)을 만듭니다.
 *
 * 환경변수
 *   OPENAI_API_KEY      (있으면 GPT 사용)
 *   OPENAI_MODEL        기본 gpt-4o-mini
 *   GEMINI_API_KEY      (OpenAI 키가 없을 때 사용)
 *   GEMINI_MODEL        기본 gemini-2.0-flash
 *   REPORT_SECRET       결제 검증용 공유 시크릿(선택)
 *
 * 지금은 시안 단계라 키가 없으면 503 AI_NOT_CONFIGURED 를 돌려줍니다.
 * 프런트엔드는 그때 규칙 기반 샘플(reportSample)을 보여줍니다.
 */
import { SYSTEM_PROMPT, buildUserPrompt } from './_lib/prompt.js';

const hits = new Map(); // 간단한 메모리 레이트리밋: 분당 6회 / IP

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 6;
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no-json');
  return JSON.parse(text.slice(start, end + 1));
}

async function callOpenAI(userPrompt) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  if (!r.ok) throw new Error('openai-' + r.status);
  const data = await r.json();
  return extractJson(data.choices[0].message.content);
}

async function callGemini(userPrompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json' }
    })
  });
  if (!r.ok) throw new Error('gemini-' + r.status);
  const data = await r.json();
  return extractJson(data.candidates[0].content.parts[0].text);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const ip = (req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'TOO_MANY_REQUESTS' });

  const { chart, product = 'deep', orderId } = req.body || {};
  if (!chart || chart.dayMaster == null) return res.status(400).json({ error: 'MISSING_CHART' });

  // 결제 검증 훅: 실제 오픈 시 orderId를 DB/포트원 결제 조회로 검증하세요.
  if (process.env.REQUIRE_PAID_ORDER === 'true') {
    if (!orderId) return res.status(402).json({ error: 'PAYMENT_REQUIRED' });
    // const paid = await verifyPortOnePayment(orderId, product);
    // if (!paid) return res.status(402).json({ error: 'PAYMENT_NOT_VERIFIED' });
  }

  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'AI_NOT_CONFIGURED',
      message: 'OPENAI_API_KEY 또는 GEMINI_API_KEY를 설정해 주세요.'
    });
  }

  try {
    const prompt = buildUserPrompt(chart, product);
    const result = process.env.OPENAI_API_KEY
      ? await callOpenAI(prompt)
      : await callGemini(prompt);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, product, report: result, orderId: orderId || null });
  } catch (err) {
    return res.status(502).json({ error: 'AI_PROVIDER_ERROR', message: String(err.message || err) });
  }
}

export const config = { maxDuration: 60 };
