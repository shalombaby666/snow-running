import type { Point } from '../data/levels';
import type { Direction } from '../entities/Player';

export interface IceChange {
  created: boolean;
  points: Point[];
}

export function useIceAction(
  origin: Point,
  facing: Direction,
  bounds: { width: number; height: number },
  walls: Set<string>,
  ice: Set<string>,
  occupied: Set<string>,
  limit = 3,
): IceChange | null {
  const first = { x: origin.x + facing.x, y: origin.y + facing.y };
  const firstKey = `${first.x},${first.y}`;
  const created = !ice.has(firstKey);
  const points: Point[] = [];
  for (let distance = 1; distance <= limit; distance += 1) {
    const point = { x: origin.x + facing.x * distance, y: origin.y + facing.y * distance };
    const key = `${point.x},${point.y}`;
    if (point.x < 1 || point.y < 1 || point.x >= bounds.width - 1 || point.y >= bounds.height - 1) break;
    if (walls.has(key) || occupied.has(key)) break;
    if (created && ice.has(key)) break;
    if (!created && !ice.has(key)) break;
    points.push(point);
  }
  if (points.length === 0) return null;

  for (const point of points) {
    const key = `${point.x},${point.y}`;
    if (created) ice.add(key);
    else ice.delete(key);
  }
  return { created, points };
}
