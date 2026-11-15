import Phaser from 'phaser';
import { SAMPLE_LEVELS, pointKey, type LevelDefinition, type Point } from '../data/levels';
import { GRID_OFFSET_Y, GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../config';
import { Enemy } from '../entities/Enemy';
import { Player, type Direction } from '../entities/Player';
import { chooseEnemyMove } from '../systems/EnemyDirector';
import { useIceAction } from '../systems/IceSystem';
import { RunState } from '../systems/RunState';
import { loadSave, saveRun } from '../systems/LocalSave';
import { Hud } from '../ui/Hud';
import { playTone } from '../sound';

interface GameStartData {
  players?: number;
}

interface Bonus {
  point: Point;
  image: Phaser.GameObjects.Image;
}

export class GameScene extends Phaser.Scene {
  private run!: RunState;
  private level!: LevelDefinition;
  private levelIndex = 0;
  private players: Player[] = [];
  private enemies: Enemy[] = [];
  private gifts = new Map<string, Phaser.GameObjects.Image>();
  private bonuses: Bonus[] = [];
  private ice = new Set<string>();
  private iceImages = new Map<string, Phaser.GameObjects.Image>();
  private exitImage!: Phaser.GameObjects.Image;
  private hud!: Hud;
  private invulnerableUntil = 0;
  private paused = false;
  private pauseLayer?: Phaser.GameObjects.Container;
  private isEnding = false;
  private readonly gameColors = ['#203d49', '#173e47', '#29374d'];

  constructor() {
    super('Game');
  }

  create(data: GameStartData): void {
    this.run = new RunState(data.players ?? 1);
    this.levelIndex = 0;
    this.isEnding = false;
    this.invulnerableUntil = 0;
    this.paused = false;
    this.hud = new Hud(this);
    this.loadLevel();
    this.input.keyboard?.on('keydown', this.handleKey, this);
    this.events.once('shutdown', () => this.input.keyboard?.off('keydown', this.handleKey, this));
  }

  update(time: number): void {
    if (this.paused || this.isEnding) return;
    for (const enemy of this.enemies) {
      const interval = enemy.kind === 'chaser' ? 255 : enemy.kind === 'ambusher' ? 350 : 420;
      if (!enemy.ready(time, interval)) continue;
      const direction = chooseEnemyMove(enemy, this.players.map((player) => ({ point: player.point, facing: player.facing })), (x, y) => this.canEnter(x, y));
      if (direction) enemy.step(this, direction);
    }
    this.resolveEnemyContact(time);
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.repeat || this.isEnding) return;
    if (event.code.startsWith('Arrow') || event.code === 'Space') event.preventDefault();
    if (event.code === 'Escape') {
      this.scene.start('Menu');
      return;
    }
    if (event.code === 'KeyP') {
      this.togglePause();
      return;
    }
    if (this.paused) return;
    const p1 = this.players[0];
    const p2 = this.players[1];
    if (!p1) return;
    const directions: Record<string, Direction> = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      KeyW: { x: 0, y: -1 }, KeyS: { x: 0, y: 1 },
      KeyA: { x: -1, y: 0 }, KeyD: { x: 1, y: 0 },
    };
    const direction = directions[event.code];
    if (direction) {
      if (event.code.startsWith('Arrow')) p1.step(this, direction, (x, y) => this.canEnter(x, y), () => this.onPlayerArrive(p1));
      else if (p2) p2.step(this, direction, (x, y) => this.canEnter(x, y), () => this.onPlayerArrive(p2));
      return;
    }
    if (event.code === 'Space') this.useAction(p1);
    if (event.code === 'KeyE' && p2) this.useAction(p2);
  }

  private loadLevel(): void {
    this.level = SAMPLE_LEVELS[this.levelIndex] ?? SAMPLE_LEVELS[0]!;
    this.children.removeAll(true);
    this.players = [];
    this.enemies = [];
    this.gifts.clear();
    this.bonuses = [];
    this.ice.clear();
    this.iceImages.clear();
    this.drawBackdrop();
    this.drawGrid();
    this.drawGifts();
    this.drawBonuses();
    this.drawExit();
    this.spawnActors();
    this.hud = new Hud(this);
    this.run.giftsRemaining = this.gifts.size;
    this.hud.update(this.run, this.level);
    const hints = [
      'СОБЕРИ ВСЕ ПОДАРКИ, ЧТОБЫ ОТКРЫТЬ ВЫХОД',
      'SPACE / E  ·  СОЗДАЙ ЛЁД ПЕРЕД СОБОЙ ИЛИ РАЗБЕЙ ЕГО',
      'ПАТРУЛЬ, ПРЕСЛЕДОВАТЕЛЬ И ПЕРЕХВАТЧИК ДВИЖУТСЯ ПО-РАЗНОМУ',
    ];
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 9, GAME_WIDTH, 18, 0x10242f, 0.96).setDepth(20);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 9, hints[this.levelIndex] ?? hints[0]!, {
      fontFamily: 'DM Mono, monospace', fontSize: '8px', color: '#a7c9bd', letterSpacing: 0.9,
    }).setOrigin(0.5).setDepth(21);
    this.isEnding = false;
  }

  private drawBackdrop(): void {
    this.cameras.main.setBackgroundColor(this.gameColors[this.levelIndex] ?? '#203d49');
    const backdrop = this.add.graphics().setDepth(-5);
    backdrop.fillStyle(0x0c202b, 0.56);
    backdrop.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    backdrop.fillStyle(0xcdece0, 0.4);
    for (let i = 0; i < 64; i += 1) {
      const x = (i * 193 + 29) % GAME_WIDTH;
      const y = GRID_OFFSET_Y + ((i * 89 + 43) % (GAME_HEIGHT - GRID_OFFSET_Y));
      backdrop.fillRect(x, y, i % 9 === 0 ? 3 : 1, i % 9 === 0 ? 3 : 1);
    }
  }

  private drawGrid(): void {
    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const key = pointKey(x, y);
        const wall = this.level.walls.has(key);
        this.add.image(x * TILE_SIZE, GRID_OFFSET_Y + y * TILE_SIZE, wall ? 'tile-wall' : 'tile-floor')
          .setOrigin(0).setDepth(wall ? 1 : 0).setTint(this.level.sky === 0x203d49 ? 0xffffff : 0xe2f7eb);
      }
    }
    const glimmer = this.add.graphics().setDepth(2);
    glimmer.fillStyle(this.level.accent, 0.16);
    for (let x = 3; x < this.level.width - 2; x += 6) {
      glimmer.fillRect(x * TILE_SIZE + 7, GRID_OFFSET_Y + 13, 18, 2);
    }
  }

  private drawGifts(): void {
    for (const point of this.level.gifts) {
      const gift = this.add.image(this.centerX(point.x), this.centerY(point.y), 'gift').setDepth(3).setScale(0.82);
      this.tweens.add({ targets: gift, y: gift.y - 2, duration: 680 + (point.x % 3) * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.gifts.set(pointKey(point.x, point.y), gift);
    }
  }

  private drawBonuses(): void {
    const candidates = [{ x: 4, y: 12 }, { x: 14, y: 2 }, { x: 26, y: 7 }];
    for (const point of candidates) {
      const key = pointKey(point.x, point.y);
      if (this.level.walls.has(key) || this.level.gifts.some((gift) => pointKey(gift.x, gift.y) === key)) continue;
      const image = this.add.image(this.centerX(point.x), this.centerY(point.y), 'bell').setDepth(3).setScale(0.84);
      this.tweens.add({ targets: image, angle: 13, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.bonuses.push({ point, image });
    }
  }

  private drawExit(): void {
    this.exitImage = this.add.image(this.centerX(this.level.exit.x), this.centerY(this.level.exit.y), 'exit')
      .setDepth(2).setAlpha(0.32).setTint(0x77939a);
  }

  private spawnActors(): void {
    this.level.players.forEach((point, index) => {
      if (index < this.run.players) {
        const costume = loadSave().selectedCostume === 'ded-moroz-blue' ? 'ded-moroz' : 'santa';
        this.players.push(new Player(this, index + 1, point, costume));
      }
    });
    for (const spawn of this.level.enemies) this.enemies.push(new Enemy(this, spawn.kind, spawn));
  }

  private onPlayerArrive(player: Player): void {
    const key = pointKey(player.gridX, player.gridY);
    const gift = this.gifts.get(key);
    if (gift) {
      gift.destroy();
      this.gifts.delete(key);
      this.run.addScore(100);
      this.run.giftsRemaining = this.gifts.size;
      playTone(740, 0.07, 'sine');
      this.updateHud();
      if (this.gifts.size === 0) {
        this.exitImage.setAlpha(1).clearTint();
        this.tweens.add({ targets: this.exitImage, scale: 1.13, duration: 500, yoyo: true, repeat: -1 });
      }
    }
    const bonusIndex = this.bonuses.findIndex((bonus) => bonus.point.x === player.gridX && bonus.point.y === player.gridY);
    if (bonusIndex >= 0) {
      const [bonus] = this.bonuses.splice(bonusIndex, 1);
      bonus?.image.destroy();
      this.run.addScore(250);
      if (this.run.lives < 3) this.run.lives += 1;
      playTone(980, 0.14, 'triangle');
      this.updateHud();
    }
    this.resolveEnemyContact(this.time.now);
    if (this.gifts.size === 0 && player.gridX === this.level.exit.x && player.gridY === this.level.exit.y) this.advanceLevel();
  }

  private useAction(player: Player): void {
    if (player.moving) return;
    const occupied = new Set<string>();
    for (const other of this.players) if (other !== player) occupied.add(pointKey(other.gridX, other.gridY));
    for (const enemy of this.enemies) occupied.add(pointKey(enemy.gridX, enemy.gridY));
    for (const key of this.gifts.keys()) occupied.add(key);
    for (const bonus of this.bonuses) occupied.add(pointKey(bonus.point.x, bonus.point.y));
    occupied.add(pointKey(this.level.exit.x, this.level.exit.y));
    const change = useIceAction(player.point, player.facing, this.level, this.level.walls, this.ice, occupied);
    if (!change) return;
    for (const point of change.points) {
      const key = pointKey(point.x, point.y);
      if (change.created) {
        const image = this.add.image(point.x * TILE_SIZE, GRID_OFFSET_Y + point.y * TILE_SIZE, 'tile-ice').setOrigin(0).setDepth(2);
        this.iceImages.set(key, image);
        this.tweens.add({ targets: image, alpha: { from: 0.76, to: 1 }, duration: 360, yoyo: true, repeat: 2 });
        this.time.delayedCall(5200, () => {
          if (this.iceImages.get(key) !== image) return;
          this.ice.delete(key);
          this.iceImages.delete(key);
          image.destroy();
        });
      } else {
        this.iceImages.get(key)?.destroy();
        this.iceImages.delete(key);
      }
    }
    playTone(change.created ? 360 : 210, 0.07, 'triangle');
  }

  private canEnter(x: number, y: number): boolean {
    const key = pointKey(x, y);
    return x >= 0 && y >= 0 && x < this.level.width && y < this.level.height && !this.level.walls.has(key) && !this.ice.has(key);
  }

  private resolveEnemyContact(time: number): void {
    if (time < this.invulnerableUntil || this.isEnding) return;
    const hit = this.players.some((player) => this.enemies.some((enemy) => player.gridX === enemy.gridX && player.gridY === enemy.gridY));
    if (!hit) return;
    const ended = this.run.loseLife();
    playTone(125, 0.22, 'sawtooth');
    this.updateHud();
    if (ended) {
      this.finishRun(false);
      return;
    }
    this.invulnerableUntil = time + 1500;
    this.players.forEach((player, index) => {
      const start = this.level.players[index];
      if (start) player.snapTo(start);
      this.tweens.add({ targets: player.sprite, alpha: 0.25, duration: 90, yoyo: true, repeat: 5 });
    });
  }

  private advanceLevel(): void {
    this.run.addScore(500 + this.run.lives * 100);
    this.levelIndex += 1;
    if (this.levelIndex >= SAMPLE_LEVELS.length) {
      this.finishRun(true);
      return;
    }
    this.run.levelIndex = this.levelIndex;
    this.loadLevel();
    playTone(590, 0.18, 'sine');
  }

  private finishRun(completed: boolean): void {
    this.isEnding = true;
    saveRun(this.run.score);
    this.scene.start('Result', {
      score: this.run.score,
      levelReached: this.level.id,
      completed,
      players: this.run.players,
    });
  }

  private togglePause(): void {
    this.paused = !this.paused;
    this.pauseLayer?.destroy(true);
    if (!this.paused) return;
    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0b1d29, 0.8);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 17, 'ПАУЗА', {
      fontFamily: 'Manrope, sans-serif', fontSize: '34px', color: '#f1f1dc', fontStyle: 'bold',
    }).setOrigin(0.5);
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 27, 'НАЖМИ P, ЧТОБЫ ПРОДОЛЖИТЬ', {
      fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#a8c4c1',
    }).setOrigin(0.5);
    this.pauseLayer = this.add.container(0, 0, [shade, title, hint]).setDepth(30);
  }

  private updateHud(): void {
    this.hud.update(this.run, this.level);
  }

  private centerX(x: number): number {
    return x * TILE_SIZE + TILE_SIZE / 2;
  }

  private centerY(y: number): number {
    return GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
  }
}
