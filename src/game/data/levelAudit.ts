import type { LevelDefinition, Point } from './levels';

export interface LevelAuditResult {
  reachableCellCount: number;
  totalWalkableCellCount: number;
  issues: string[];
}

const keyOf = (point: Point): string => `${point.x},${point.y}`;

export function auditLevelReachability(level: LevelDefinition): LevelAuditResult {
  const issues: string[] = [];
  const start = level.players[0];
  if (!start) return { reachableCellCount: 0, totalWalkableCellCount: 0, issues: ['no player start'] };

  const queue: Point[] = [start];
  const reachable = new Set<string>();
  const inBounds = (point: Point) => point.x >= 0 && point.y >= 0 && point.x < level.width && point.y < level.height;
  if (!inBounds(start) || level.walls.has(keyOf(start))) {
    return { reachableCellCount: 0, totalWalkableCellCount: 0, issues: [`player start ${keyOf(start)} is blocked or outside the level`] };
  }
  reachable.add(keyOf(start));

  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    if (!point) continue;
    for (const next of [
      { x: point.x + 1, y: point.y }, { x: point.x - 1, y: point.y },
      { x: point.x, y: point.y + 1 }, { x: point.x, y: point.y - 1 },
    ]) {
      const key = keyOf(next);
      if (!inBounds(next) || level.walls.has(key) || reachable.has(key)) continue;
      reachable.add(key);
      queue.push(next);
    }
  }

  const required = [
    ...level.players.map((point) => ({ label: 'player start', point })),
    ...level.gifts.map((point) => ({ label: 'gift', point })),
    { label: 'exit', point: level.exit },
    ...level.enemies.map((enemy) => ({ label: `${enemy.kind} spawn`, point: enemy })),
  ];
  for (const target of required) {
    const key = keyOf(target.point);
    if (!inBounds(target.point) || !reachable.has(key)) issues.push(`${target.label} ${key} is unreachable`);
  }

  let totalWalkableCellCount = 0;
  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      if (!level.walls.has(`${x},${y}`)) totalWalkableCellCount += 1;
    }
  }
  if (reachable.size !== totalWalkableCellCount) {
    issues.push(`${totalWalkableCellCount - reachable.size} walkable cells are disconnected from the player start`);
  }

  return { reachableCellCount: reachable.size, totalWalkableCellCount, issues };
}
