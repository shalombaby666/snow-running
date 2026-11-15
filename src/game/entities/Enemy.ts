import Phaser from 'phaser';
import type { EnemyKind, Point } from '../data/levels';
import { GRID_OFFSET_Y, TILE_SIZE } from '../config';
import type { Direction } from './Player';

export class Enemy {
  readonly sprite: Phaser.GameObjects.Image;
  readonly kind: EnemyKind;
  gridX: number;
  gridY: number;
  direction: Direction = { x: 0, y: 1 };
  moving = false;
  private lastMoveAt = 0;

  constructor(scene: Phaser.Scene, kind: EnemyKind, start: Point, colorOffset = 0) {
    this.kind = kind;
    this.gridX = start.x;
    this.gridY = start.y;
    const texture = kind === 'patroller' ? 'enemy-patroller' : kind === 'chaser' ? 'enemy-chaser' : 'enemy-ambusher';
    this.sprite = scene.add.image(this.centerX(start.x), this.centerY(start.y), texture).setDepth(4).setScale(0.92);
    this.sprite.setTint(colorOffset || 0xffffff);
  }

  get point(): Point {
    return { x: this.gridX, y: this.gridY };
  }

  ready(now: number, interval: number): boolean {
    return !this.moving && now - this.lastMoveAt >= interval;
  }

  step(scene: Phaser.Scene, direction: Direction): void {
    if (this.moving || (direction.x === 0 && direction.y === 0)) return;
    this.direction = direction;
    const nextX = this.gridX + direction.x;
    const nextY = this.gridY + direction.y;
    this.gridX = nextX;
    this.gridY = nextY;
    this.moving = true;
    this.lastMoveAt = scene.time.now;
    this.sprite.setFlipX(direction.x < 0);
    scene.tweens.add({
      targets: this.sprite,
      x: this.centerX(nextX),
      y: this.centerY(nextY),
      duration: 155,
      ease: 'Linear',
      onComplete: () => { this.moving = false; },
    });
  }

  private centerX(x: number): number {
    return x * TILE_SIZE + TILE_SIZE / 2;
  }

  private centerY(y: number): number {
    return GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
  }
}
