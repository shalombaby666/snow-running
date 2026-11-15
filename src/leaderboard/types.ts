export interface ScoreEntry {
  id: number;
  player_name: string;
  score: number;
  level_reached: number;
  created_at: string;
}

export interface ScoreSubmission {
  playerName: string;
  score: number;
  levelReached: number;
}
