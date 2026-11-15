import { STARTING_LIVES } from '../config';

export class RunState {
  score = 0;
  lives = STARTING_LIVES;
  levelIndex = 0;
  giftsRemaining = 0;
  readonly players: number;

  constructor(players: number) {
    this.players = players === 2 ? 2 : 1;
  }

  addScore(points: number): void {
    this.score += points;
  }

  loseLife(): boolean {
    this.lives = Math.max(0, this.lives - 1);
    return this.lives === 0;
  }

  resetCampaign(): void {
    this.score = 0;
    this.lives = STARTING_LIVES;
    this.levelIndex = 0;
  }
}
