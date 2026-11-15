import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { fetchTopScores, leaderboardEnabled } from '../../leaderboard/client';
import { loadSave, setSelectedCostume } from '../systems/LocalSave';

function text(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, family = 'Manrope, sans-serif'): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    fontFamily: family, fontSize: `${size}px`, color, fontStyle: 'bold',
    align: 'center', letterSpacing: 1,
  }).setOrigin(0.5);
}

export class MenuScene extends Phaser.Scene {
  private costumePreview?: Phaser.GameObjects.Image;
  private costumeLabel?: Phaser.GameObjects.Text;
  private currentCostume = 'santa-red';

  constructor() {
    super('Menu');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#203d49');
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x274c55, 0x274c55, 0x18323e, 0x18323e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0x6da69b, 0.18);
    bg.fillEllipse(130, 470, 460, 190);
    bg.fillStyle(0x15313b, 0.58);
    bg.fillEllipse(830, 500, 620, 220);
    bg.fillStyle(0xd7eee0, 0.48);
    for (let i = 0; i < 60; i += 1) {
      const x = (i * 173 + 43) % GAME_WIDTH;
      const y = (i * 97 + 17) % GAME_HEIGHT;
      bg.fillRect(x, y, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2);
    }

    this.add.image(770, 353, 'kuki').setScale(4).setAlpha(0.93);
    this.add.image(839, 435, 'reindeer').setScale(2.1);
    this.add.image(691, 463, 'sleigh').setScale(1.45);
    this.currentCostume = loadSave().selectedCostume;
    this.costumePreview = this.add.image(197, 386, this.currentCostume === 'ded-moroz-blue' ? 'ded-moroz' : 'santa').setScale(3.3);
    this.add.image(279, 413, 'snow-maiden').setScale(2.6).setAlpha(0.88);
    this.add.image(831, 172, 'spark').setScale(2.4).setAlpha(0.82);

    text(this, GAME_WIDTH / 2, 107, 'ПРАЗДНИК В ОПАСНОСТИ', 12, '#a9d8cb', 'DM Mono, monospace');
    text(this, GAME_WIDTH / 2, 167, 'SNOW', 58, '#f5f1dc');
    text(this, GAME_WIDTH / 2, 225, 'RUNNING', 48, '#ffd17d');
    text(this, GAME_WIDTH / 2, 273, 'Собери подарки. Перехитри морозных монстров.', 15, '#c3d8cf');

    this.makeButton(GAME_WIDTH / 2 - 115, 344, 'ОДИН ИГРОК', 'Solo', 1, true);
    this.makeButton(GAME_WIDTH / 2 + 115, 344, 'ИГРАТЬ ВДВОЁМ', 'Duo', 2, false);

    this.makeCostumeButton();

    this.add.image(GAME_WIDTH / 2 - 132, 424, 'spark').setScale(0.85);
    text(this, GAME_WIDTH / 2 + 4, 424, 'ЛЁД СОЗДАЁТ ПУТЬ — И ЗАДЕРЖИВАЕТ ВРАГА', 10, '#9bbab7', 'DM Mono, monospace');
    text(this, GAME_WIDTH / 2, GAME_HEIGHT - 31, '33 УРОВНЯ  ·  3 ЖИЗНИ  ·  ОДНА БОЛЬШАЯ ЗИМНЯЯ ИСТОРИЯ', 9, '#73929a', 'DM Mono, monospace');
    this.drawLeaderboard();

    this.input.keyboard?.once('keydown-SPACE', () => this.begin(1));
    this.input.keyboard?.once('keydown-ENTER', () => this.begin(1));
  }

  private makeButton(x: number, y: number, label: string, key: string, players: number, primary: boolean): void {
    const fill = primary ? 0xffd17d : 0x365965;
    const color = primary ? '#18313a' : '#e5f0e6';
    const button = this.add.container(x, y);
    const shape = this.add.graphics();
    shape.fillStyle(fill, 1);
    shape.fillRect(-96, -24, 192, 48);
    shape.fillStyle(primary ? 0xffe2a0 : 0x51737a, 1);
    shape.fillRect(-96, -24, 192, 4);
    shape.lineStyle(1, primary ? 0xffe8ad : 0x80b2ab, 0.8);
    shape.strokeRect(-96, -24, 192, 48);
    const caption = this.add.text(0, 0, label, {
      fontFamily: 'DM Mono, monospace', fontSize: '12px', fontStyle: 'bold', color, letterSpacing: 1,
    }).setOrigin(0.5);
    button.add([shape, caption]).setSize(192, 48).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setScale(1.04));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', () => this.begin(players));
    button.setData('key', key);
  }

  private begin(players: number): void {
    this.scene.start('Game', { players });
  }

  private makeCostumeButton(): void {
    const button = this.add.container(GAME_WIDTH / 2, 474);
    const background = this.add.graphics();
    background.fillStyle(0x24414a, 0.96);
    background.fillRect(-130, -17, 260, 34);
    background.lineStyle(1, 0x779e9e, 0.8);
    background.strokeRect(-130, -17, 260, 34);
    this.costumeLabel = this.add.text(0, 0, '', {
      fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#d5e6dc', letterSpacing: 0.8,
    }).setOrigin(0.5);
    button.add([background, this.costumeLabel]).setSize(260, 34).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setScale(1.03));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', () => {
      if (!loadSave().costumes.includes('ded-moroz-blue')) {
        this.costumeLabel?.setText('ДЕД МОРОЗ ОТКРОЕТСЯ ЗА 800 ОЧКОВ');
        return;
      }
      this.currentCostume = this.currentCostume === 'santa-red' ? 'ded-moroz-blue' : 'santa-red';
      setSelectedCostume(this.currentCostume);
      this.updateCostumePreview();
    });
    this.updateCostumePreview();
  }

  private updateCostumePreview(): void {
    const isDedMoroz = this.currentCostume === 'ded-moroz-blue';
    const unlocked = loadSave().costumes.includes('ded-moroz-blue');
    this.costumeLabel?.setText(unlocked
      ? `ОБРАЗ: ${isDedMoroz ? 'ДЕД МОРОЗ' : 'САНТА'}   ↻`
      : 'ОБРАЗ: САНТА  ·  ДЕД МОРОЗ ЗА 800 ОЧКОВ');
    this.costumePreview?.setTexture(isDedMoroz ? 'ded-moroz' : 'santa');
  }

  private drawLeaderboard(): void {
    const card = this.add.graphics().setDepth(6);
    card.fillStyle(0x102832, 0.82);
    card.fillRect(22, 449, 238, 74);
    card.lineStyle(1, 0x507177, 0.7);
    card.strokeRect(22, 449, 238, 74);
    this.add.text(34, 457, 'ЗИМНИЙ РЕКОРД', {
      fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#ffd17d', letterSpacing: 1,
    }).setDepth(7);
    const localBest = loadSave().bestScore;
    const scores = this.add.text(34, 475, `ЛУЧШИЙ ЗАБЕГ  ${localBest.toLocaleString('ru-RU')}\n${leaderboardEnabled() ? 'ЗАГРУЗКА ТАБЛИЦЫ…' : 'ОФЛАЙН-ТАБЛИЦА'}`, {
      fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#a8c5c0', lineSpacing: 4,
    }).setDepth(7);
    if (leaderboardEnabled()) {
      void fetchTopScores(3).then((entries) => {
        if (!this.sys.isActive()) return;
        const rows = entries.map((entry, index) => `${index + 1}. ${entry.player_name.slice(0, 12)}  ${entry.score.toLocaleString('ru-RU')}`);
        scores.setText([`ЛУЧШИЙ ЗАБЕГ  ${localBest.toLocaleString('ru-RU')}`, ...(rows.length ? rows : ['ПОКА НЕТ РЕКОРДОВ'])].join('\n'));
      }).catch(() => {
        if (this.sys.isActive()) scores.setText(`ЛУЧШИЙ ЗАБЕГ  ${localBest.toLocaleString('ru-RU')}\nТАБЛИЦА НЕДОСТУПНА`);
      });
    }
  }
}
