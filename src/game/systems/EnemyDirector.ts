import type { EnemyKind, Point } from '../data/levels';
import type { Enemy } from '../entities/Enemy';
import type { Direction } from '../entities/Player';

const DIRECTIONS: Direction[] = [
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
];

function key(point: Point): string {
  return `${point.x},${point.y}`;
}

function shortestStep(start: Point, target: Point, canEnter: (x: number, y: number) => boolean): Direction | null {
  const queue: Array<{ point: Point; first: Direction | null }> = [{ point: start, first: null }];
  const visited = new Set([key(start)]);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.point.x === target.x && current.point.y === target.y) return current.first;
    for (const direction of DIRECTIONS) {
      const next = { x: current.point.x + direction.x, y: current.point.y + direction.y };
      const nextKey = key(next);
      if (visited.has(nextKey) || (next.x !== target.x || next.y !== target.y) && !canEnter(next.x, next.y)) continue;
      visited.add(nextKey);
      queue.push({ point: next, first: current.first ?? direction });
    }
  }
  return null;
}

export function chooseEnemyMove(
  enemy: Enemy,
  players: Array<{ point: Point; facing: Direction }>,
  canEnter: (x: number, y: number) => boolean,
): Direction | null {
  if (players.length === 0) return null;
  if (enemy.kind === 'patroller') return patrolMove(enemy, canEnter);
  const targetPlayer = nearestPlayer(enemy.point, players);
  const target = targetPlayer.point;
  if (enemy.kind === 'chaser') return shortestStep(enemy.point, target, canEnter) ?? patrolMove(enemy, canEnter);
  const ahead = { x: target.x + targetPlayer.facing.x * 2, y: target.y + targetPlayer.facing.y * 2 };
  const aim = canEnter(ahead.x, ahead.y) ? ahead : target;
  return shortestStep(enemy.point, aim, canEnter) ?? patrolMove(enemy, canEnter);
}

function nearestPlayer(from: Point, players: Array<{ point: Point; facing: Direction }>): { point: Point; facing: Direction } {
  return [...players].sort((a, b) =>
    Math.abs(a.point.x - from.x) + Math.abs(a.point.y - from.y) - (Math.abs(b.point.x - from.x) + Math.abs(b.point.y - from.y))
  )[0] ?? { point: from, facing: { x: 1, y: 0 } };
}

function patrolMove(enemy: Enemy, canEnter: (x: number, y: number) => boolean): Direction | null {
  const choices = [enemy.direction, ...DIRECTIONS.filter((direction) => direction.x !== -enemy.direction.x || direction.y !== -enemy.direction.y)];
  for (const direction of choices) {
    if (canEnter(enemy.gridX + direction.x, enemy.gridY + direction.y)) return direction;
  }
  const reverse = DIRECTIONS.find((direction) => direction.x === -enemy.direction.x && direction.y === -enemy.direction.y);
  return reverse && canEnter(enemy.gridX + reverse.x, enemy.gridY + reverse.y) ? reverse : null;
}

export function enemyTypeLabel(kind: EnemyKind): string {
  return kind === 'patroller' ? 'Патруль' : kind === 'chaser' ? 'Преследователь' : 'Перехватчик';
}
