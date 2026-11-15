import Phaser from 'phaser';
import type { Point } from '../data/levels';
import { GRID_OFFSET_Y, TILE_SIZE } from '../config';

export type Direction = { x: number; y: number };

export class Player {
  readonly sprite: Phaser.GameObjects.Image;
  readonly id: number;
  gridX: number;
  gridY: number;
  facing: Direction = { x: 1, y: 0 };
  moving = false;

  constructor(scene: Phaser.Scene, id: number, start: Point, santaCostume = 'santa') {
    this.id = id;
    this.gridX = start.x;
    this.gridY = start.y;
    this.sprite = scene.add.image(this.centerX(start.x), this.centerY(start.y), id === 1 ? santaCostume : 'snow-maiden')
      .setDepth(5).setScale(1.06);
  }

  get point(): Point {
    return { x: this.gridX, y: this.gridY };
  }

  step(scene: Phaser.Scene, direction: Direction, canEnter: (x: number, y: number) => boolean, afterMove: () => void): void {
    this.facing = direction;
    if (this.moving) return;
    const nextX = this.gridX + direction.x;
    const nextY = this.gridY + direction.y;
    if (!canEnter(nextX, nextY)) return;
    this.moving = true;
    this.gridX = nextX;
    this.gridY = nextY;
    this.sprite.setFlipX(direction.x < 0);
    scene.tweens.add({
      targets: this.sprite,
      x: this.centerX(nextX),
      y: this.centerY(nextY),
      duration: 105,
      ease: 'Linear',
      onComplete: () => {
        this.moving = false;
        afterMove();
      },
    });
  }

  snapTo(point: Point): void {
    this.gridX = point.x;
    this.gridY = point.y;
    this.moving = false;
    this.sprite.setPosition(this.centerX(point.x), this.centerY(point.y));
  }

  setActive(active: boolean): void {
    this.sprite.setVisible(active);
  }

  private centerX(x: number): number {
    return x * TILE_SIZE + TILE_SIZE / 2;
  }

  private centerY(y: number): number {
    return GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
  }
}
