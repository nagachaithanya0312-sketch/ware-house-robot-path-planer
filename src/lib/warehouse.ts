/**
 * Warehouse model + A* path planning with congestion penalty.
 *
 * TOTAL ROUTE COST = PATH COST g(n) + ESTIMATED DISTANCE h(n) + CONGESTION PENALTY
 */

export const COLS = 25;
export const ROWS = 15;

export type Cell = { x: number; y: number };

export type Shelf = {
  label: string;
  cells: Cell[];
  /** free aisle cell a robot can stop at to service the shelf */
  access: Cell;
};

export type Warehouse = {
  cols: number;
  rows: number;
  /** true when the cell is blocked (shelf / obstacle) */
  blocked: boolean[][];
  shelves: Shelf[];
  shelfByCell: Map<string, string>;
};

export const key = (c: Cell) => `${c.x},${c.y}`;

/** deterministic pseudo random so server and client agree */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const BLOCK_ROWS = [
  { y: 2, letter: "A" },
  { y: 5, letter: "B" },
  { y: 8, letter: "C" },
  { y: 11, letter: "D" },
];

export function buildWarehouse(): Warehouse {
  const blocked: boolean[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => false),
  );
  const shelves: Shelf[] = [];
  const shelfByCell = new Map<string, string>();

  for (const block of BLOCK_ROWS) {
    let index = 0;
    for (let x = 2; x <= COLS - 3; x += 1) {
      // vertical cross aisles
      if (x % 6 === 0) continue;
      index += 1;
      const label = `${block.letter}${index}`;
      const cells: Cell[] = [
        { x, y: block.y },
        { x, y: block.y + 1 },
      ];
      for (const c of cells) {
        blocked[c.y][c.x] = true;
        shelfByCell.set(key(c), label);
      }
      shelves.push({ label, cells, access: { x, y: block.y - 1 } });
    }
  }

  // a few standalone obstacles (pallets / charging docks)
  for (const o of [
    { x: 12, y: 0 },
    { x: 18, y: 14 },
    { x: 6, y: 14 },
    { x: 23, y: 7 },
  ]) {
    blocked[o.y][o.x] = true;
  }

  return { cols: COLS, rows: ROWS, blocked, shelves, shelfByCell };
}

export type CongestionLevel = "LOW" | "MEDIUM" | "HIGH";

/** congestion field in 0..1 for every cell, built from historical-traffic hotspots */
export function predictCongestion(
  w: Warehouse,
  level: CongestionLevel,
  seed = 7,
): number[][] {
  const rnd = seeded(seed);
  const field = Array.from({ length: w.rows }, () =>
    Array.from({ length: w.cols }, () => 0),
  );
  const intensity = level === "LOW" ? 0.35 : level === "MEDIUM" ? 0.7 : 1;
  const hotspotCount = level === "LOW" ? 3 : level === "MEDIUM" ? 5 : 7;

  const hotspots: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < hotspotCount; i += 1) {
    hotspots.push({
      x: Math.floor(rnd() * w.cols),
      y: Math.floor(rnd() * w.rows),
      r: 2.4 + rnd() * 2.6,
    });
  }

  for (let y = 0; y < w.rows; y += 1) {
    for (let x = 0; x < w.cols; x += 1) {
      if (w.blocked[y][x]) continue;
      let v = 0;
      for (const h of hotspots) {
        const d = Math.hypot(x - h.x, y - h.y);
        if (d < h.r) v += (1 - d / h.r) * intensity;
      }
      field[y][x] = Math.min(1, v + rnd() * 0.06);
    }
  }
  return field;
}

export function congestionBand(v: number): CongestionLevel {
  if (v >= 0.6) return "HIGH";
  if (v >= 0.3) return "MEDIUM";
  return "LOW";
}

export type AStarResult = {
  path: Cell[];
  explored: Cell[];
  /** number of grid steps */
  steps: number;
  /** sum of g-costs including congestion penalty */
  cost: number;
  /** congestion portion of the cost */
  penalty: number;
  found: boolean;
};

export const CONGESTION_WEIGHT = 4;

/**
 * A* on the 4-connected grid graph.
 * f(n) = g(n) + h(n); entering a cell costs 1 + weight * congestion(cell).
 */
export function aStar(
  w: Warehouse,
  start: Cell,
  goal: Cell,
  congestion: number[][] | null,
  weight = CONGESTION_WEIGHT,
): AStarResult {
  const inBounds = (c: Cell) => c.x >= 0 && c.y >= 0 && c.x < w.cols && c.y < w.rows;
  const walkable = (c: Cell) => inBounds(c) && !w.blocked[c.y][c.x];
  if (!walkable(start) || !walkable(goal)) {
    return { path: [], explored: [], steps: 0, cost: 0, penalty: 0, found: false };
  }

  const h = (c: Cell) => Math.abs(c.x - goal.x) + Math.abs(c.y - goal.y);
  const gScore = new Map<string, number>([[key(start), 0]]);
  const penScore = new Map<string, number>([[key(start), 0]]);
  const cameFrom = new Map<string, Cell>();
  const open: { cell: Cell; f: number }[] = [{ cell: start, f: h(start) }];
  const closed = new Set<string>();
  const explored: Cell[] = [];

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!.cell;
    const ck = key(current);
    if (closed.has(ck)) continue;
    closed.add(ck);
    explored.push(current);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Cell[] = [current];
      let cur = ck;
      while (cameFrom.has(cur)) {
        const prev = cameFrom.get(cur)!;
        path.unshift(prev);
        cur = key(prev);
      }
      return {
        path,
        explored,
        steps: path.length - 1,
        cost: gScore.get(ck) ?? 0,
        penalty: penScore.get(ck) ?? 0,
        found: true,
      };
    }

    const neighbors: Cell[] = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const n of neighbors) {
      if (!walkable(n)) continue;
      const nk = key(n);
      if (closed.has(nk)) continue;
      const pen = congestion ? weight * congestion[n.y][n.x] : 0;
      const tentative = (gScore.get(ck) ?? Infinity) + 1 + pen;
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentative);
        penScore.set(nk, (penScore.get(ck) ?? 0) + pen);
        cameFrom.set(nk, current);
        open.push({ cell: n, f: tentative + h(n) });
      }
    }
  }

  return { path: [], explored, steps: 0, cost: 0, penalty: 0, found: false };
}

export const DEFAULT_START: Cell = { x: 1, y: 1 };

export function shelfByLabel(w: Warehouse, label: string) {
  return w.shelves.find((s) => s.label === label);
}

export function robots() {
  return [
    { id: "R01", start: { x: 1, y: 1 } as Cell },
    { id: "R02", start: { x: 1, y: 13 } as Cell },
    { id: "R03", start: { x: COLS - 2, y: 13 } as Cell },
  ];
}
