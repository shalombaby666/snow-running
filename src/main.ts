import Phaser from 'phaser';
import './styles.css';
import { GAME_HEIGHT, GAME_WIDTH } from './game/config';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { ResultScene } from './game/scenes/ResultScene';
import { isSoundEnabled, setSoundEnabled } from './game/sound';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#142a36',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [BootScene, MenuScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  input: { keyboard: true },
});

const soundToggle = document.querySelector<HTMLButtonElement>('#sound-toggle');
soundToggle?.addEventListener('click', () => {
  setSoundEnabled(!isSoundEnabled());
  soundToggle.textContent = isSoundEnabled() ? '♫' : '♪';
  soundToggle.setAttribute('aria-label', isSoundEnabled() ? 'Звук включён' : 'Звук выключен');
});
