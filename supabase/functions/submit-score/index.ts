const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }
  if (typeof body !== 'object' || body === null) return json({ error: 'Invalid score entry.' }, 400);

  const input = body as Record<string, unknown>;
  const playerName = typeof input.playerName === 'string'
    ? input.playerName.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 18)
    : '';
  const score = Number(input.score);
  const levelReached = Number(input.levelReached);
  if (!playerName || !Number.isInteger(score) || score < 0 || score > 500000) {
    return json({ error: 'Name or score is outside the allowed range.' }, 400);
  }
  if (!Number.isInteger(levelReached) || levelReached < 1 || levelReached > 33) {
    return json({ error: 'Level is outside the allowed range.' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ error: 'Leaderboard service is not configured.' }, 503);

  const insert = await fetch(`${supabaseUrl}/rest/v1/leaderboard`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ player_name: playerName, score, level_reached: levelReached }),
  });
  if (!insert.ok) return json({ error: 'Could not save this score.' }, 502);
  return json({ ok: true }, 201);
});

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
