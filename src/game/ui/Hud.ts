import Phaser from 'phaser';
import type { LevelDefinition } from '../data/levels';
import type { RunState } from '../systems/RunState';
import { GAME_WIDTH } from '../config';

export class Hud {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly region: Phaser.GameObjects.Text;
  private readonly level: Phaser.GameObjects.Text;
  private readonly score: Phaser.GameObjects.Text;
  private readonly lives: Phaser.GameObjects.Text;
  private readonly gifts: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    this.background = scene.add.rectangle(GAME_WIDTH / 2, 21, GAME_WIDTH, 42, 0x10242f, 0.98).setDepth(20);
    this.background.setStrokeStyle(1, 0x42656b, 0.72);
    this.region = scene.add.text(19, 8, '', this.style(9, '#9cc8bb', 'DM Mono, monospace')).setDepth(21);
    this.level = scene.add.text(GAME_WIDTH / 2, 8, '', this.style(9, '#f2dfb2', 'DM Mono, monospace')).setOrigin(0.5, 0).setDepth(21);
    this.score = scene.add.text(GAME_WIDTH - 19, 7, '', this.style(12, '#f5f0dd', 'DM Mono, monospace')).setOrigin(1, 0).setDepth(21);
    this.lives = scene.add.text(19, 24, '', this.style(10, '#f1aaa0', 'DM Mono, monospace')).setDepth(21);
    this.gifts = scene.add.text(GAME_WIDTH / 2, 24, '', this.style(10, '#bce6d5', 'DM Mono, monospace')).setOrigin(0.5, 0).setDepth(21);
    scene.add.text(GAME_WIDTH - 19, 26, 'P ПАУЗА · ESC МЕНЮ', this.style(7, '#89a8ad', 'DM Mono, monospace')).setOrigin(1, 0).setDepth(21);
  }

  update(run: RunState, level: LevelDefinition): void {
    this.region.setText(level.region);
    this.level.setText(`${String(level.id).padStart(2, '0')} / 33     ${level.title.toUpperCase()}`);
    this.score.setText(`✦ ${run.score.toLocaleString('ru-RU')}`);
    this.lives.setText(`ЖИЗНИ  ${'♥ '.repeat(run.lives).trim()}`);
    this.gifts.setText(`ПОДАРКИ  ${run.giftsRemaining}`);
  }

  private style(size: number, color: string, fontFamily: string): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily, fontSize: `${size}px`, color, fontStyle: 'bold', letterSpacing: 0.8 };
  }
}
