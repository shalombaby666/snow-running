export type EnemyKind = 'patroller' | 'chaser' | 'ambusher';
export type Point = { x: number; y: number };

export interface EnemySpawn extends Point {
  kind: EnemyKind;
}

export interface LevelDefinition {
  id: number;
  title: string;
  region: string;
  sky: number;
  accent: number;
  width: number;
  height: number;
  walls: Set<string>;
  gifts: Point[];
  exit: Point;
  players: Point[];
  enemies: EnemySpawn[];
}

const keyOf = ({ x, y }: Point) => `${x},${y}`;

function buildWalls(width: number, height: number, variant: number): Set<string> {
  const walls = new Set<string>();
  const add = (x: number, y: number) => walls.add(keyOf({ x, y }));
  for (let x = 0; x < width; x += 1) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    add(0, y);
    add(width - 1, y);
  }

  const verticals = [5, 10, 15, 20, 25];
  for (const [index, x] of verticals.entries()) {
    const openings = new Set([
      2 + ((variant + index) % 3),
      7 + ((variant * 2 + index) % 3),
      11 + ((variant + index * 2) % 2),
    ]);
    for (let y = 1; y < height - 1; y += 1) {
      if (!openings.has(y)) add(x, y);
    }
  }

  const horizontals = [4, 9];
  for (const [index, y] of horizontals.entries()) {
    const openings = new Set([
      3 + ((variant + index * 3) % 4),
      14 + ((variant + index) % 4),
      24 + ((variant * 2 + index) % 3),
    ]);
    for (let x = 1; x < width - 1; x += 1) {
      if (!openings.has(x)) add(x, y);
    }
  }

  // Small winter hedges make each sector feel like a room without sealing routes.
  const hedges = [
    [{ x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }],
    [{ x: 7, y: 12 }, { x: 8, y: 12 }],
    [{ x: 12, y: 2 }, { x: 13, y: 2 }, { x: 14, y: 2 }],
    [{ x: 17, y: 6 }, { x: 18, y: 6 }],
    [{ x: 22, y: 12 }, { x: 23, y: 12 }, { x: 24, y: 12 }],
    [{ x: 27, y: 2 }, { x: 27, y: 3 }],
  ];
  for (const group of hedges) {
    for (const point of group) {
      if ((point.x + point.y + variant) % 2 === 0) add(point.x, point.y);
    }
  }
  return walls;
}

function makeLevel(id: number, title: string, region: string, sky: number, accent: number, variant: number): LevelDefinition {
  const width = 30;
  const height = 15;
  const walls = buildWalls(width, height, variant);
  const gifts = [
    { x: 3, y: 2 }, { x: 8, y: 3 }, { x: 13, y: 6 },
    { x: 18, y: 2 }, { x: 23, y: 6 }, { x: 27, y: 11 },
    { x: 7, y: 12 }, { x: 17, y: 12 }, { x: 22, y: 2 },
  ].filter((point) => !walls.has(keyOf(point)));
  const enemyPoints = [
    { kind: 'patroller' as const, x: 27, y: 2 },
    ...(variant >= 1 ? [{ kind: 'chaser' as const, x: 14, y: 7 }] : []),
    ...(variant >= 2 ? [{ kind: 'ambusher' as const, x: 23, y: 12 }] : []),
  ].filter((enemy) => !walls.has(keyOf(enemy)) && !gifts.some((gift) => keyOf(gift) === keyOf(enemy)));

  return {
    id, title, region, sky, accent, width, height, walls, gifts,
    exit: { x: 28, y: 13 },
    players: [{ x: 1, y: 1 }, { x: 1, y: 2 }],
    enemies: enemyPoints,
  };
}

export const SAMPLE_LEVELS: LevelDefinition[] = [
  makeLevel(1, 'Подарки на пути', 'ПРЯНИЧНЫЙ ГОРОДОК', 0x203d49, 0xffd17d, 0),
  makeLevel(2, 'Следы в лесу', 'ЛЕС СЕВЕРНЫХ ОЛЕНЕЙ', 0x173e47, 0xa7d88f, 1),
  makeLevel(3, 'Мастерская огней', 'МАСТЕРСКАЯ САНТЫ', 0x29374d, 0xe8896f, 2),
];

export function pointKey(x: number, y: number): string {
  return `${x},${y}`;
}
