import { neon } from '@neondatabase/serverless';

const allowedTypes = new Set(['brand-brief', 'talent-application']);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function clean(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

export async function POST(request) {
  if (!process.env.DATABASE_URL) {
    return json({ ok: false, error: 'Storage is not configured yet.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const type = clean(body.type, 40);
  if (!allowedTypes.has(type)) {
    return json({ ok: false, error: 'Invalid submission type.' }, 400);
  }

  const payload = body.data && typeof body.data === 'object' ? body.data : {};
  const data = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [clean(key, 80), clean(value)])
  );

  if (!data.email && type === 'brand-brief') {
    return json({ ok: false, error: 'Email is required.' }, 400);
  }

  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS northline_submissions (
      id BIGSERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const [row] = await sql`
    INSERT INTO northline_submissions (type, data)
    VALUES (${type}, ${JSON.stringify(data)}::jsonb)
    RETURNING id, created_at
  `;

  return json({ ok: true, id: row.id, createdAt: row.created_at });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}
