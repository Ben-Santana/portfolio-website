import * as THREE from 'three';
import { Seg, seg, polyline, ring, rectXZ, assembleShapes, ShapeSet, mulberry32 } from './shapes';

// One procedural wireframe per project, keyed by project slug. Same Seg-list
// style as the hero shapes so any two can be morphed between.

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Icosahedron edge segments, optionally translated vertically. */
function icoEdges(radius: number, detail: number, dy = 0): Seg[] {
  const out: Seg[] = [];
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const edges = new THREE.EdgesGeometry(geo);
  const pos = edges.getAttribute('position');
  for (let i = 0; i < pos.count; i += 2) {
    out.push([
      pos.getX(i), pos.getY(i) + dy, pos.getZ(i),
      pos.getX(i + 1), pos.getY(i + 1) + dy, pos.getZ(i + 1),
    ]);
  }
  geo.dispose();
  edges.dispose();
  return out;
}

// --- ARena: stadium bowl -------------------------------------------------------

function stadium(): Seg[] {
  const out: Seg[] = [];
  const tiers = [
    { rx: 1.0, rz: 0.68, y: -0.35 },
    { rx: 1.28, rz: 0.88, y: -0.08 },
    { rx: 1.52, rz: 1.06, y: 0.2 },
    { rx: 1.72, rz: 1.22, y: 0.5 },
  ];
  const n = 40;
  const tierPoint = (t: (typeof tiers)[number], a: number) =>
    v(Math.cos(a) * t.rx, t.y, Math.sin(a) * t.rz);

  for (const t of tiers) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) pts.push(tierPoint(t, (i / n) * Math.PI * 2));
    polyline(pts, out);
  }
  // Vertical struts up the bowl
  for (let i = 0; i < n; i += 4) {
    const a = (i / n) * Math.PI * 2;
    polyline(tiers.map((t) => tierPoint(t, a)), out);
  }
  // Field with halfway line and center circle
  rectXZ(-0.72, -0.44, 0.72, 0.44, -0.35, out);
  out.push(seg(v(0, -0.35, -0.44), v(0, -0.35, 0.44)));
  ring(0, -0.35, 0, 0.2, 16, out);
  return out;
}

// --- D&D Narrator: d20 hovering over an open book ------------------------------

function d20Book(): Seg[] {
  const out: Seg[] = [];
  const spineY = -0.78;

  for (const side of [1, -1] as const) {
    const pt = (u: number, z: number) => v(side * 1.28 * u, spineY + 0.34 * u, z);
    polyline([pt(0.02, -0.88), pt(1, -0.88), pt(1, 0.88), pt(0.02, 0.88)], out, true);
    // Text lines running across each page
    for (const z of [-0.55, -0.18, 0.19, 0.56]) {
      out.push(seg(pt(0.14, z), pt(0.88, z)));
    }
  }
  // Spine
  out.push(seg(v(0, spineY, -0.88), v(0, spineY, 0.88)));

  // The die floats above the book
  out.push(...icoEdges(0.78, 0, 0.42));
  return out;
}

// --- Wireless Security Scanner: lattice antenna, signal arcs, RF burst ---------

function antenna(): Seg[] {
  const out: Seg[] = [];
  const baseY = -1.0;
  const topY = 0.7;
  const levels = 5;
  const ys = Array.from({ length: levels }, (_, i) => baseY + (i / (levels - 1)) * (topY - baseY));
  const hw = (y: number) => 0.06 + ((topY - y) / (topY - baseY)) * 0.26;

  // Tapering mast: horizontal squares + corner legs
  for (const y of ys) rectXZ(-hw(y), -hw(y), hw(y), hw(y), y, out);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    polyline(ys.map((y) => v(sx * hw(y), y, sz * hw(y))), out);
  }
  // Tip element
  const tip = v(0, topY + 0.22, 0);
  out.push(seg(v(0, topY, 0), tip));

  // Signal arcs radiating from the tip on both sides
  for (const side of [1, -1]) {
    for (const r of [0.32, 0.58, 0.84]) {
      const pts: THREE.Vector3[] = [];
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const a = -0.65 + (i / n) * 1.3;
        pts.push(v(tip.x + side * Math.cos(a) * r, tip.y + Math.sin(a) * r, 0));
      }
      polyline(pts, out);
    }
  }

  // Captured RF burst along the base
  const pts: THREE.Vector3[] = [];
  const m = 56;
  for (let i = 0; i <= m; i++) {
    const x = -1.7 + (i / m) * 3.4;
    const env = Math.exp(-x * x * 2.2);
    pts.push(v(x, baseY - 0.32 + Math.sin(x * 9) * 0.3 * env, 0));
  }
  polyline(pts, out);
  return out;
}

// --- Tomo: voxel space invader with shooter ship -------------------------------

const INVADER_BITMAP = [
  '00100000100',
  '00010001000',
  '00111111100',
  '01101110110',
  '11111111111',
  '10111111101',
  '10100000101',
  '00011011000',
];

function invader(): Seg[] {
  const out: Seg[] = [];
  const cell = 0.16;
  const cols = INVADER_BITMAP[0].length;
  const rows = INVADER_BITMAP.length;
  const x0 = (-cols * cell) / 2;
  const yTop = 0.9;
  const depth = 0.18;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (INVADER_BITMAP[r][c] !== '1') continue;
      const xa = x0 + c * cell;
      const xb = xa + cell;
      const ya = yTop - r * cell;
      const yb = ya - cell;
      const quad = (z: number) =>
        polyline([v(xa, ya, z), v(xb, ya, z), v(xb, yb, z), v(xa, yb, z)], out, true);
      quad(depth / 2);
      quad(-depth / 2);
      out.push(seg(v(xa, ya, depth / 2), v(xa, ya, -depth / 2)));
      out.push(seg(v(xb, yb, depth / 2), v(xb, yb, -depth / 2)));
    }
  }

  // Shooter ship below
  const shipY = -1.15;
  polyline(
    [
      v(-0.45, shipY, 0), v(0.45, shipY, 0), v(0.45, shipY + 0.14, 0), v(0.08, shipY + 0.14, 0),
      v(0.08, shipY + 0.3, 0), v(-0.08, shipY + 0.3, 0), v(-0.08, shipY + 0.14, 0), v(-0.45, shipY + 0.14, 0),
    ],
    out,
    true,
  );
  // Projectile (dashed)
  for (const y of [-0.75, -0.58]) {
    out.push(seg(v(0, y, 0), v(0, y + 0.1, 0)));
  }
  return out;
}

// --- Immersive Living Room: launchpad grid with light beams --------------------

function launchpad(): Seg[] {
  const out: Seg[] = [];
  const ext = 1.3;
  const y = -0.55;
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = -ext + (i / n) * 2 * ext;
    out.push(seg(v(t, y, -ext), v(t, y, ext)));
    out.push(seg(v(-ext, y, t), v(ext, y, t)));
  }

  const rand = mulberry32(11);
  const cellSize = (2 * ext) / n;
  const litCells: Array<[number, number]> = [[1, 2], [3, 5], [4, 1], [6, 6], [2, 6], [5, 3]];
  for (const [cx, cz] of litCells) {
    const px = -ext + (cx + 0.5) * cellSize;
    const pz = -ext + (cz + 0.5) * cellSize;
    const s = cellSize * 0.32;
    rectXZ(px - s, pz - s, px + s, pz + s, y + 0.01, out);

    // Beam: narrow frustum tilting outward from the pad
    const topY = y + 1.5 + rand() * 0.5;
    const tx = px * 1.35;
    const tz = pz * 1.35;
    const ts = s * 0.5;
    rectXZ(tx - ts, tz - ts, tx + ts, tz + ts, topY, out);
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      out.push(seg(v(px + sx * s, y + 0.01, pz + sz * s), v(tx + sx * ts, topY, tz + sz * ts)));
    }
  }
  return out;
}

// --- Exodus: network graph with a breached node ---------------------------------

function network(): Seg[] {
  const out: Seg[] = [];
  const rand = mulberry32(7);
  const nodes: THREE.Vector3[] = [];
  const count = 11;
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.5 + rand() * 1.1;
    nodes.push(v(Math.cos(a) * r, (rand() - 0.5) * 1.3, Math.sin(a) * r));
  }
  for (const nd of nodes) ring(nd.x, nd.y, nd.z, 0.11, 6, out);

  // Connect each node to its two nearest neighbours (deduped)
  const added = new Set<string>();
  nodes.forEach((nd, i) => {
    const nearest = nodes
      .map((o, j) => ({ j, d: i === j ? Infinity : nd.distanceTo(o) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (added.has(key)) continue;
      added.add(key);
      out.push(seg(nd, nodes[j]));
    }
  });

  // Breached node: radiating spikes
  const b = nodes[4];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const dir = v(Math.cos(a), (rand() - 0.5) * 1.4, Math.sin(a)).normalize();
    out.push(seg(
      b.clone().addScaledVector(dir, 0.16),
      b.clone().addScaledVector(dir, 0.42),
    ));
  }
  return out;
}

// --- Procedural Lizard: spine spline, rib rings, IK legs ------------------------

function lizard(): Seg[] {
  const out: Seg[] = [];
  const N = 26;
  const spine = (t: number) => v(-1.55 + 3.1 * t, 0, Math.sin(t * Math.PI * 2) * 0.42);
  const radius = (t: number) =>
    0.03 +
    0.26 * Math.exp(-((t - 0.42) ** 2) / 0.055) +
    0.13 * Math.exp(-((t - 0.06) ** 2) / 0.006);
  const tangentAt = (t: number) =>
    spine(Math.min(1, t + 0.02)).sub(spine(Math.max(0, t - 0.02))).normalize();

  polyline(Array.from({ length: N + 1 }, (_, i) => spine(i / N)), out);

  // Rib rings perpendicular to the spine, tapering toward the tail
  for (let i = 1; i < N; i += 2) {
    const t = i / N;
    const r = radius(t);
    const tangent = tangentAt(t);
    const side = new THREE.Vector3().crossVectors(tangent, v(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(side, tangent).normalize();
    const c = spine(t);
    const pts: THREE.Vector3[] = [];
    const sides = 8;
    for (let k = 0; k <= sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      pts.push(c.clone().addScaledVector(side, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r));
    }
    polyline(pts, out);
  }

  // Two-bone legs with three toes each
  const legAnchors: Array<[number, number]> = [[0.22, 1], [0.22, -1], [0.62, 1], [0.62, -1]];
  for (const [t, dir] of legAnchors) {
    const c = spine(t);
    const tangent = tangentAt(t);
    const side = new THREE.Vector3().crossVectors(tangent, v(0, 1, 0)).normalize().multiplyScalar(dir);
    const shoulder = c.clone().addScaledVector(side, radius(t) * 0.8);
    const elbow = shoulder.clone().addScaledVector(side, 0.26).add(v(0.05, 0.15, 0));
    const foot = elbow.clone().addScaledVector(side, 0.18).add(v(0.14, -0.36, 0));
    polyline([shoulder, elbow, foot], out);

    const toeBase = side.clone().setY(0).normalize();
    for (const ang of [-0.5, 0, 0.5]) {
      const d = toeBase.clone().applyAxisAngle(v(0, 1, 0), ang);
      out.push(seg(foot, foot.clone().addScaledVector(d, 0.15)));
    }
  }
  return out;
}

// --- Flock Simulation: boid triangles along a swooping curve --------------------

function flock(): Seg[] {
  const out: Seg[] = [];
  const rand = mulberry32(99);
  const curve = (t: number) =>
    v(
      -1.7 + 3.4 * t,
      Math.sin(t * Math.PI * 1.6) * 0.6 - 0.05,
      Math.cos(t * Math.PI * 1.1) * 0.55,
    );
  const count = 14;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const jitter = v((rand() - 0.5) * 0.3, (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5);
    const p = curve(t).add(jitter);
    const tangent = curve(Math.min(1, t + 0.03)).sub(curve(Math.max(0, t - 0.03))).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, v(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(side, tangent).normalize();
    const size = 0.1 + rand() * 0.06;

    const tip = p.clone().addScaledVector(tangent, size * 1.6);
    const b1 = p.clone().addScaledVector(tangent, -size).addScaledVector(side, size * 0.8);
    const b2 = p.clone().addScaledVector(tangent, -size).addScaledVector(side, -size * 0.8);
    const fin = p.clone().addScaledVector(tangent, -size * 0.6).addScaledVector(up, size * 0.7);
    polyline([tip, b1, b2], out, true);
    out.push(seg(tip, fin));
  }
  return out;
}

// --- Slime Mold: branching filaments from a nucleus ------------------------------

function slime(): Seg[] {
  const out: Seg[] = [];
  const rand = mulberry32(2024);

  out.push(...icoEdges(0.2, 0));

  const walk = (start: THREE.Vector3, startDir: THREE.Vector3, steps: number, len: number, canBranch: boolean) => {
    let p = start.clone();
    const d = startDir.clone();
    for (let s = 0; s < steps; s++) {
      d.add(v((rand() - 0.5) * 0.5, (rand() - 0.5) * 0.4, (rand() - 0.5) * 0.5)).normalize();
      const q = p.clone().addScaledVector(d, len * (1 - s * 0.08));
      out.push(seg(p, q));
      if (canBranch && rand() < 0.4) {
        const bd = d.clone().add(v((rand() - 0.5) * 1.6, (rand() - 0.5) * 1.0, (rand() - 0.5) * 1.6)).normalize();
        walk(q, bd, 3, len * 0.6, false);
      }
      p = q;
    }
    // Filament tip: tiny diamond
    const e = 0.045;
    polyline([v(p.x - e, p.y, p.z), v(p.x, p.y, p.z - e), v(p.x + e, p.y, p.z), v(p.x, p.y, p.z + e)], out, true);
  };

  const branches = 7;
  for (let b = 0; b < branches; b++) {
    const a = (b / branches) * Math.PI * 2 + rand() * 0.4;
    const dir = v(Math.cos(a), (rand() - 0.5) * 0.7, Math.sin(a)).normalize();
    walk(dir.clone().multiplyScalar(0.22), dir, 6, 0.24, true);
  }
  return out;
}

// --- Assembly --------------------------------------------------------------------

const builders: Record<string, () => Seg[]> = {
  arena: stadium,
  'dnd-narrator': d20Book,
  'wireless-security': antenna,
  tomo: invader,
  lights: launchpad,
  exodus: network,
  'proc-gen': lizard,
  'flock-simulation': flock,
  'slime-sim': slime,
};

/** Build the morphable shape set for the given project slugs, in order. */
export function buildProjectShapes(slugs: string[]): ShapeSet {
  return assembleShapes(slugs.map((slug) => (builders[slug] ?? (() => icoEdges(1.2, 1)))()));
}

const accents: Record<string, string> = {
  arena: '#3b82f6', // stadium floodlight blue
  'dnd-narrator': '#a855f7', // arcane purple
  'wireless-security': '#22d3ee', // radar cyan
  tomo: '#22c55e', // arcade phosphor green
  lights: '#fb923c', // stage-light orange
  exodus: '#ef4444', // breach red
  'proc-gen': '#84cc16', // lizard lime
  'flock-simulation': '#0ea5e9', // sky blue
  'slime-sim': '#eab308', // physarum yellow
};

/** Accent color per project slug, in order. */
export function projectAccentColors(slugs: string[]): string[] {
  return slugs.map((slug) => accents[slug] ?? '#8b8b8b');
}
