import Phaser from 'phaser';
import { createPixelArt } from '../art/PixelArt';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    createPixelArt(this);
    this.scene.start('Menu');
  }
}
