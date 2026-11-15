import Phaser from 'phaser';
import { COLORS, TILE_SIZE } from '../config';

type Paint = (graphics: Phaser.GameObjects.Graphics) => void;

function texture(scene: Phaser.Scene, key: string, width: number, height: number, paint: Paint): void {
  if (scene.textures.exists(key)) return;
  const graphics = scene.add.graphics({ x: 0, y: 0 });
  paint(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function rect(g: Phaser.GameObjects.Graphics, color: number, x: number, y: number, w: number, h: number): void {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

export function createPixelArt(scene: Phaser.Scene): void {
  const t = TILE_SIZE;
  texture(scene, 'tile-floor', t, t, (g) => {
    rect(g, 0x203b45, 0, 0, t, t);
    rect(g, 0x274650, 2, 2, t - 4, t - 4);
    rect(g, 0x7aa6a0, 6, 7, 2, 2);
    rect(g, 0x7aa6a0, 24, 22, 2, 2);
    rect(g, 0x355b61, 15, 14, 2, 2);
  });

  texture(scene, 'tile-wall', t, t, (g) => {
    rect(g, 0x24434e, 0, 0, t, t);
    rect(g, 0x47717a, 2, 4, t - 4, t - 6);
    rect(g, 0x8dbbb1, 2, 3, t - 4, 4);
    rect(g, 0xd3e7d6, 4, 3, 8, 2);
    rect(g, 0x355b65, 2, t - 4, t - 4, 2);
    rect(g, 0x6e9999, 22, 10, 4, 4);
  });

  texture(scene, 'tile-ice', t, t, (g) => {
    rect(g, 0x357b88, 2, 2, t - 4, t - 4);
    rect(g, 0x9ee8df, 4, 4, t - 8, 5);
    rect(g, 0xd8f4df, 6, 5, 8, 2);
    rect(g, 0x6eb9c0, 5, 13, 21, 12);
    rect(g, 0x4e9ba9, 8, 17, 7, 3);
    rect(g, 0xc2f1e8, 18, 11, 3, 3);
  });

  texture(scene, 'gift', 24, 24, (g) => {
    rect(g, 0x8f453f, 3, 7, 18, 14);
    rect(g, 0xe98265, 3, 6, 18, 3);
    rect(g, 0xffd17d, 10, 7, 5, 14);
    rect(g, 0xffe6a7, 8, 3, 5, 5);
    rect(g, 0xffe6a7, 13, 3, 5, 5);
    rect(g, 0xffd17d, 11, 4, 4, 3);
    rect(g, 0xf8bd72, 4, 21, 18, 2);
  });

  texture(scene, 'exit', 32, 32, (g) => {
    rect(g, 0x3c6b79, 5, 4, 22, 25);
    rect(g, 0x8be0cf, 8, 6, 16, 20);
    rect(g, 0xe5f5db, 11, 8, 10, 15);
    rect(g, 0x6ec8b5, 13, 10, 6, 11);
    rect(g, 0xf5d387, 15, 14, 3, 3);
    rect(g, 0xb0e5d2, 2, 11, 3, 10);
    rect(g, 0xb0e5d2, 27, 11, 3, 10);
  });

  texture(scene, 'santa', 28, 32, (g) => {
    rect(g, 0x592f3c, 6, 25, 7, 4); rect(g, 0x592f3c, 17, 25, 7, 4);
    rect(g, 0x9e453f, 5, 17, 18, 9); rect(g, 0xd95e51, 7, 17, 14, 8);
    rect(g, 0x6e3841, 5, 23, 18, 3); rect(g, 0xf2c374, 12, 19, 5, 5);
    rect(g, 0xffddad, 7, 8, 14, 11); rect(g, 0xeac48f, 5, 11, 3, 7);
    rect(g, 0xffffff, 5, 12, 4, 6); rect(g, 0xffffff, 19, 12, 4, 6);
    rect(g, 0xffffff, 7, 16, 14, 6); rect(g, 0xf8f1dc, 9, 17, 10, 4);
    rect(g, 0x342e3d, 10, 12, 2, 2); rect(g, 0x342e3d, 17, 12, 2, 2);
    rect(g, 0xd95e51, 8, 5, 12, 5); rect(g, 0xd95e51, 11, 2, 9, 4);
    rect(g, 0xffffff, 7, 8, 14, 3); rect(g, 0xffffff, 18, 1, 5, 4);
  });

  texture(scene, 'ded-moroz', 28, 32, (g) => {
    rect(g, 0x343c63, 6, 25, 7, 4); rect(g, 0x343c63, 17, 25, 7, 4);
    rect(g, 0x415d93, 5, 17, 18, 9); rect(g, 0x577fc0, 7, 17, 14, 8);
    rect(g, 0xffddad, 7, 8, 14, 11); rect(g, 0xeac48f, 5, 11, 3, 7);
    rect(g, 0xffffff, 5, 12, 4, 6); rect(g, 0xffffff, 19, 12, 4, 6);
    rect(g, 0xffffff, 7, 16, 14, 6); rect(g, 0xf8f1dc, 9, 17, 10, 4);
    rect(g, 0x342e3d, 10, 12, 2, 2); rect(g, 0x342e3d, 17, 12, 2, 2);
    rect(g, 0x577fc0, 7, 5, 14, 6); rect(g, 0x86b4e0, 9, 3, 10, 4);
    rect(g, 0xffffff, 7, 9, 14, 3); rect(g, 0xffffff, 18, 2, 5, 3);
    rect(g, 0xcce6f1, 12, 19, 5, 5);
  });

  texture(scene, 'snow-maiden', 28, 32, (g) => {
    rect(g, 0x324675, 5, 25, 7, 4); rect(g, 0x324675, 17, 25, 7, 4);
    rect(g, 0x408f9a, 5, 17, 18, 9); rect(g, 0x70c8c2, 7, 16, 14, 9);
    rect(g, 0xffdfb5, 7, 8, 14, 11); rect(g, 0xd29b79, 5, 12, 3, 7);
    rect(g, 0x293b62, 9, 12, 2, 2); rect(g, 0x293b62, 17, 12, 2, 2);
    rect(g, 0x6375be, 5, 5, 18, 6); rect(g, 0x6375be, 9, 2, 11, 5);
    rect(g, 0xe5f5db, 4, 9, 20, 3); rect(g, 0xb0e5d2, 9, 18, 11, 3);
    rect(g, 0xffd17d, 12, 19, 4, 4); rect(g, 0x98d8d0, 21, 12, 3, 6);
  });

  texture(scene, 'enemy-patroller', 28, 28, (g) => {
    rect(g, 0x8a4b3e, 5, 6, 18, 18); rect(g, 0xb97856, 7, 4, 14, 18);
    rect(g, 0xf1d7a4, 7, 4, 14, 4); rect(g, 0xfff0cb, 4, 10, 4, 3);
    rect(g, 0xfff0cb, 20, 10, 4, 3); rect(g, 0x3a3341, 10, 11, 2, 3);
    rect(g, 0x3a3341, 17, 11, 2, 3); rect(g, 0x8c3b3c, 10, 19, 8, 2);
    rect(g, 0x67423c, 7, 23, 5, 3); rect(g, 0x67423c, 17, 23, 5, 3);
  });

  texture(scene, 'enemy-chaser', 28, 28, (g) => {
    rect(g, 0x398a88, 5, 7, 18, 17); rect(g, 0x6cc7ad, 8, 4, 12, 20);
    rect(g, 0xb1e5c1, 9, 5, 10, 4); rect(g, 0xfff1d7, 8, 11, 5, 6);
    rect(g, 0xfff1d7, 16, 11, 5, 6); rect(g, 0x244354, 10, 13, 2, 3);
    rect(g, 0x244354, 17, 13, 2, 3); rect(g, 0x437e79, 7, 22, 5, 4);
    rect(g, 0x437e79, 17, 22, 5, 4); rect(g, 0xe5f5db, 4, 6, 4, 3);
  });

  texture(scene, 'enemy-ambusher', 28, 28, (g) => {
    rect(g, 0x685b8c, 5, 8, 18, 15); rect(g, 0xa99ac1, 7, 5, 14, 18);
    rect(g, 0xe1d8f2, 8, 6, 12, 5); rect(g, 0xfff1d7, 8, 12, 5, 5);
    rect(g, 0xfff1d7, 16, 12, 5, 5); rect(g, 0x344254, 10, 13, 2, 3);
    rect(g, 0x344254, 17, 13, 2, 3); rect(g, 0x786d98, 7, 21, 5, 5);
    rect(g, 0x786d98, 17, 21, 5, 5); rect(g, 0xffd17d, 12, 4, 4, 3);
  });

  texture(scene, 'kuki', 32, 32, (g) => {
    rect(g, 0x734434, 6, 7, 20, 18); rect(g, 0x9c6144, 8, 5, 16, 18);
    rect(g, 0xfff0d5, 8, 6, 4, 3); rect(g, 0xfff0d5, 18, 6, 5, 3);
    rect(g, 0xfff0d5, 6, 12, 4, 3); rect(g, 0xfff0d5, 23, 12, 4, 3);
    rect(g, 0x332d39, 11, 12, 2, 2); rect(g, 0x332d39, 19, 12, 2, 2);
    rect(g, 0xf4d7a7, 13, 17, 6, 2); rect(g, 0xe7796a, 14, 16, 4, 3);
    rect(g, 0x734434, 8, 23, 5, 4); rect(g, 0x734434, 19, 23, 5, 4);
    rect(g, 0x7cd0b3, 4, 2, 4, 5); rect(g, 0x7cd0b3, 24, 2, 4, 5);
  });

  texture(scene, 'bell', 20, 20, (g) => {
    rect(g, COLORS.gold, 6, 4, 9, 12); rect(g, 0xffedab, 8, 2, 5, 3);
    rect(g, 0xa77746, 9, 16, 4, 2); rect(g, 0xfff2c7, 8, 7, 3, 4);
  });

  texture(scene, 'spark', 20, 20, (g) => {
    rect(g, 0xffd17d, 9, 1, 3, 18); rect(g, 0xffd17d, 1, 9, 18, 3);
    rect(g, 0xfff0ba, 7, 7, 7, 7); rect(g, 0xfff8df, 9, 5, 3, 11);
  });

  texture(scene, 'snowflake', 20, 20, (g) => {
    rect(g, 0xe0f5e6, 9, 1, 2, 18); rect(g, 0xe0f5e6, 1, 9, 18, 2);
    rect(g, 0xe0f5e6, 4, 4, 2, 2); rect(g, 0xe0f5e6, 14, 14, 2, 2);
    rect(g, 0xe0f5e6, 14, 4, 2, 2); rect(g, 0xe0f5e6, 4, 14, 2, 2);
  });

  texture(scene, 'reindeer', 32, 32, (g) => {
    rect(g, 0x754b3e, 8, 11, 17, 15); rect(g, 0x9c674b, 11, 8, 12, 14);
    rect(g, 0xe9c393, 19, 12, 10, 8); rect(g, 0xffefd0, 24, 16, 3, 2);
    rect(g, 0x332d39, 22, 12, 2, 2); rect(g, 0xd98f73, 27, 17, 3, 3);
    rect(g, 0x754b3e, 10, 23, 4, 7); rect(g, 0x754b3e, 21, 23, 4, 7);
    rect(g, 0xffd17d, 13, 21, 8, 3); rect(g, 0x8f453f, 12, 5, 3, 5);
    rect(g, 0x8f453f, 20, 4, 3, 5); rect(g, 0x8f453f, 9, 2, 5, 3);
    rect(g, 0x8f453f, 21, 1, 5, 3); rect(g, 0xffffff, 8, 10, 4, 3);
  });

  texture(scene, 'sleigh', 40, 28, (g) => {
    rect(g, 0x9a4d45, 7, 8, 27, 13); rect(g, 0xc2604f, 11, 5, 20, 4);
    rect(g, 0xffd17d, 8, 7, 25, 3); rect(g, 0xf3c374, 8, 20, 24, 3);
    rect(g, 0xd39b55, 4, 24, 31, 2); rect(g, 0xffe3a1, 2, 24, 5, 2);
    rect(g, 0xf5d795, 15, 10, 3, 7); rect(g, 0xf5d795, 23, 10, 3, 7);
    rect(g, 0xffffff, 12, 2, 7, 4); rect(g, 0xffffff, 22, 2, 7, 4);
  });
}
