import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { leaderboardEnabled, submitScore } from '../../leaderboard/client';

export interface ResultData {
  score: number;
  levelReached: number;
  completed: boolean;
  players: number;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(data: ResultData): void {
    this.cameras.main.setBackgroundColor('#142a36');
    const veil = this.add.graphics();
    veil.fillStyle(0x0c1b29, 0.93);
    veil.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add.image(GAME_WIDTH / 2, 130, data.completed ? 'spark' : 'kuki').setScale(data.completed ? 2.6 : 1.7);
    this.add.text(GAME_WIDTH / 2, 198, data.completed ? 'ПРАЗДНИК СПАСЁН!' : 'СНЕЖНАЯ ПАУЗА', {
      fontFamily: 'Manrope, sans-serif', fontSize: '30px', color: '#f5f1dc', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 238, data.completed ? 'Подарки доставлены по всему Северу.' : 'Санта снова отправится в путь с самого начала.', {
      fontFamily: 'Manrope, sans-serif', fontSize: '14px', color: '#a9c7c4',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 290, `СЧЁТ  ${data.score.toLocaleString('ru-RU')}     ·     УРОВЕНЬ  ${data.levelReached}`, {
      fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#ffd17d',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 430, 'ENTER  ·  НОВЫЙ ЗАБЕГ', {
      fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#d3e9df',
      backgroundColor: '#315967', padding: { x: 18, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Game', { players: data.players }));
    this.add.text(GAME_WIDTH / 2, 482, 'ESC  ·  В МЕНЮ', {
      fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8bacb1',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('Menu'));

    const scoreForm = this.createScoreForm(data);
    document.querySelector('#game')?.append(scoreForm);
    this.events.once('shutdown', () => scoreForm.remove());

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Game', { players: data.players }));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('Menu'));
  }

  private createScoreForm(data: ResultData): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'score-entry';
    const input = document.createElement('input');
    input.className = 'score-name';
    input.type = 'text';
    input.maxLength = 18;
    input.autocomplete = 'name';
    input.placeholder = leaderboardEnabled() ? 'ТВОЁ ИМЯ' : 'ТАБЛИЦА ПОКА ОФЛАЙН';
    input.setAttribute('aria-label', 'Имя для таблицы рекордов');
    input.disabled = !leaderboardEnabled();
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'ЗАПИСАТЬ РЕКОРД';
    button.disabled = !leaderboardEnabled();
    const message = document.createElement('span');
    message.className = 'score-message';
    message.textContent = leaderboardEnabled() ? 'ОТПРАВЬ РЕЗУЛЬТАТ В ТАБЛИЦУ' : 'ЛОКАЛЬНЫЙ РЕКОРД СОХРАНЁН';
    form.append(input, button, message);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      message.textContent = 'СОХРАНЯЕМ…';
      try {
        await submitScore({ playerName: input.value, score: data.score, levelReached: data.levelReached });
        message.textContent = 'РЕКОРД ДОБАВЛЕН';
      } catch {
        message.textContent = 'НЕ УДАЛОСЬ ОТПРАВИТЬ';
        button.disabled = false;
      }
    });
    return form;
  }
}
