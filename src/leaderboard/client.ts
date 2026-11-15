import type { ScoreEntry, ScoreSubmission } from './types';

const endpoint = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function leaderboardEnabled(): boolean {
  return Boolean(endpoint && publicKey);
}

export async function fetchTopScores(limit = 5): Promise<ScoreEntry[]> {
  if (!leaderboardEnabled() || !endpoint || !publicKey) return [];
  const query = new URLSearchParams({
    select: 'id,player_name,score,level_reached,created_at',
    order: 'score.desc,created_at.asc',
    limit: String(Math.min(10, Math.max(1, limit))),
  });
  const response = await fetch(`${endpoint}/rest/v1/leaderboard?${query}`, {
    headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` },
  });
  if (!response.ok) throw new Error(`Leaderboard request failed (${response.status})`);
  return response.json() as Promise<ScoreEntry[]>;
}

export async function submitScore(input: ScoreSubmission): Promise<void> {
  if (!leaderboardEnabled() || !endpoint || !publicKey) throw new Error('Online leaderboard is not configured.');
  const response = await fetch(`${endpoint}/functions/v1/submit-score`, {
    method: 'POST',
    headers: {
      apikey: publicKey,
      Authorization: `Bearer ${publicKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Score submission failed (${response.status})`);
  }
}
