import * as THREE from 'three';

// Each shape is a flat list of line segments: [ax, ay, az, bx, by, bz] per segment.
// All shapes are padded to the same segment count so the render loop can lerp
// endpoint positions between any two shapes.

export type Seg = [number, number, number, number, number, number];

export function seg(a: THREE.Vector3, b: THREE.Vector3): Seg {
  return [a.x, a.y, a.z, b.x, b.y, b.z];
}

export function polyline(points: THREE.Vector3[], out: Seg[], close = false) {
  for (let i = 0; i < points.length - 1; i++) out.push(seg(points[i], points[i + 1]));
  if (close && points.length > 2) out.push(seg(points[points.length - 1], points[0]));
}

/** Regular polygon ring in the XZ plane at height y. */
export function ring(cx: number, y: number, cz: number, radius: number, sides: number, out: Seg[]) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push(new THREE.Vector3(cx + Math.cos(a) * radius, y, cz + Math.sin(a) * radius));
  }
  polyline(pts, out);
}

/** Axis-aligned rectangle outline in the XZ plane at height y. */
export function rectXZ(x0: number, z0: number, x1: number, z1: number, y: number, out: Seg[]) {
  const p = (x: number, z: number) => new THREE.Vector3(x, y, z);
  polyline([p(x0, z0), p(x1, z0), p(x1, z1), p(x0, z1)], out, true);
}

// --- Shape 1: abstract geodesic + orbit rings (hero) -------------------------

function geodesic(): Seg[] {
  const out: Seg[] = [];
  const geo = new THREE.IcosahedronGeometry(1.3, 1);
  const edges = new THREE.EdgesGeometry(geo);
  const pos = edges.getAttribute('position');
  for (let i = 0; i < pos.count; i += 2) {
    out.push([
      pos.getX(i), pos.getY(i), pos.getZ(i),
      pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1),
    ]);
  }
  geo.dispose();
  edges.dispose();

  // Tilted orbit rings around the core
  const rings: Array<[number, number, number]> = [
    [1.8, 0.45, 0],
    [2.0, -0.35, 0.6],
    [1.65, 1.25, -0.25],
  ];
  for (const [radius, tiltX, tiltZ] of rings) {
    const pts: THREE.Vector3[] = [];
    const n = 44;
    const euler = new THREE.Euler(tiltX, 0, tiltZ);
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyEuler(euler));
    }
    polyline(pts, out);
  }
  return out;
}

// --- Shape 2: grand piano schematic (awards) ---------------------------------

function grandPiano(): Seg[] {
  const out: Seg[] = [];

  // Top-down grand piano outline (shape XY mapped to world XZ, front edge at +z)
  const s = new THREE.Shape();
  s.moveTo(-1.05, 1.15);
  s.lineTo(1.05, 1.15);
  s.lineTo(1.05, 0.45);
  s.bezierCurveTo(1.05, 0.0, 0.72, -0.12, 0.68, -0.45);
  s.bezierCurveTo(0.64, -0.85, 0.55, -1.15, 0.05, -1.3);
  s.bezierCurveTo(-0.55, -1.45, -1.05, -1.15, -1.05, -0.55);
  s.lineTo(-1.05, 1.15);
  const outline = s.getPoints(6).map((p) => new THREE.Vector2(p.x, p.y));

  const topY = 0.42;
  const bottomY = 0.1;
  const to3 = (p: THREE.Vector2, y: number) => new THREE.Vector3(p.x, y, p.y);

  // Body rim: top + bottom outline and vertical connectors
  polyline(outline.map((p) => to3(p, topY)), out, true);
  polyline(outline.map((p) => to3(p, bottomY)), out, true);
  for (let i = 0; i < outline.length; i += 4) {
    out.push(seg(to3(outline[i], topY), to3(outline[i], bottomY)));
  }

  // Keybed protruding from the front edge
  const keyY = topY - 0.06;
  const kz0 = 1.15;
  const kz1 = 1.5;
  rectXZ(-1.05, kz0, 1.05, kz1, keyY, out);
  // Key divider lines
  const keys = 14;
  for (let i = 0; i <= keys; i++) {
    const x = -0.98 + (i / keys) * 1.96;
    out.push(seg(new THREE.Vector3(x, keyY, kz0 + 0.06), new THREE.Vector3(x, keyY, kz1 - 0.04)));
  }

  // Open lid: outline rotated up around the hinge along the left (straight) side
  const hingeX = -1.05;
  const lidAngle = 0.95;
  const cos = Math.cos(lidAngle);
  const sin = Math.sin(lidAngle);
  const lidPoint = (p: THREE.Vector2) => {
    const dx = p.x - hingeX;
    return new THREE.Vector3(hingeX + dx * cos, topY + dx * sin, p.y);
  };
  polyline(outline.map(lidPoint), out, true);
  // Lid prop stick
  out.push(seg(new THREE.Vector3(0.72, topY, 0.1), lidPoint(new THREE.Vector2(0.55, -0.1))));

  // Legs with small feet
  const legs: Array<[number, number]> = [[-0.85, 0.95], [0.85, 0.95], [-0.35, -1.05]];
  for (const [lx, lz] of legs) {
    out.push(seg(new THREE.Vector3(lx, bottomY, lz), new THREE.Vector3(lx, -0.85, lz)));
    out.push(seg(new THREE.Vector3(lx - 0.09, -0.85, lz), new THREE.Vector3(lx + 0.09, -0.85, lz)));
  }

  // Shift down so the open lid and keybed stay in frame
  return out.map((sg) => [sg[0], sg[1] - 0.25, sg[2], sg[3], sg[4] - 0.25, sg[5]] as Seg);
}

// --- Shape 3: graduation cap (education) -------------------------------------

function gradCap(): Seg[] {
  const out: Seg[] = [];
  const boardY = 0.5;

  // Mortarboard: outer square, inner square, diagonals
  rectXZ(-1.35, -1.35, 1.35, 1.35, boardY, out);
  rectXZ(-1.1, -1.1, 1.1, 1.1, boardY - 0.02, out);
  out.push(seg(new THREE.Vector3(-1.35, boardY, -1.35), new THREE.Vector3(1.35, boardY, 1.35)));
  out.push(seg(new THREE.Vector3(-1.35, boardY, 1.35), new THREE.Vector3(1.35, boardY, -1.35)));

  // Center button
  rectXZ(-0.09, -0.09, 0.09, 0.09, boardY + 0.04, out);

  // Skull band: octagon at two heights + verticals
  ring(0, boardY - 0.05, 0, 0.75, 8, out);
  ring(0, -0.15, 0, 0.68, 8, out);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    out.push(seg(
      new THREE.Vector3(Math.cos(a) * 0.75, boardY - 0.05, Math.sin(a) * 0.75),
      new THREE.Vector3(Math.cos(a) * 0.68, -0.15, Math.sin(a) * 0.68),
    ));
  }

  // Tassel: from the button, over the board edge, hanging down with a tuft
  const corner = new THREE.Vector3(1.35, boardY, 1.35);
  const hangTop = new THREE.Vector3(1.42, boardY - 0.25, 1.42);
  const hangBottom = new THREE.Vector3(1.45, -0.45, 1.45);
  polyline([new THREE.Vector3(0, boardY + 0.06, 0), corner, hangTop, hangBottom], out);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    out.push(seg(
      hangBottom,
      new THREE.Vector3(hangBottom.x + Math.cos(a) * 0.08, hangBottom.y - 0.28, hangBottom.z + Math.sin(a) * 0.08),
    ));
  }

  // Recenter vertically
  return out.map((sg) => [sg[0], sg[1] - 0.1, sg[2], sg[3], sg[4] - 0.1, sg[5]] as Seg);
}

// --- Shape 4: circuit board / MCU (experience) --------------------------------

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circuitBoard(): Seg[] {
  const out: Seg[] = [];
  const rand = mulberry32(1337);

  // Board outline: top face, bottom face, corner verticals
  rectXZ(-1.7, -1.15, 1.7, 1.15, 0, out);
  rectXZ(-1.7, -1.15, 1.7, 1.15, -0.09, out);
  for (const [x, z] of [[-1.7, -1.15], [1.7, -1.15], [1.7, 1.15], [-1.7, 1.15]]) {
    out.push(seg(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, -0.09, z)));
  }

  // Corner mounting holes
  for (const [x, z] of [[-1.5, -0.95], [1.5, -0.95], [1.5, 0.95], [-1.5, 0.95]]) {
    ring(x, 0.005, z, 0.09, 6, out);
  }

  // Center chip: raised square with corner posts
  const c = 0.45;
  const chipY = 0.18;
  rectXZ(-c, -c, c, c, chipY, out);
  rectXZ(-c, -c, c, c, 0.02, out);
  for (const [x, z] of [[-c, -c], [c, -c], [c, c], [-c, c]]) {
    out.push(seg(new THREE.Vector3(x, chipY, z), new THREE.Vector3(x, 0.02, z)));
  }
  // Chip notch (pin-1 marker)
  out.push(seg(new THREE.Vector3(-c + 0.06, chipY + 0.005, -c + 0.18), new THREE.Vector3(-c + 0.18, chipY + 0.005, -c + 0.06)));

  // Pins on all four sides + routed traces ending in vias
  const pinsPerSide = 6;
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < pinsPerSide; i++) {
      const t = -c + 0.12 + (i / (pinsPerSide - 1)) * (2 * c - 0.24);
      // Pin start on chip edge, landing on board slightly outward
      let px = 0, pz = 0, dx = 0, dz = 0;
      if (side === 0) { px = t; pz = -c; dz = -1; }
      if (side === 1) { px = c; pz = t; dx = 1; }
      if (side === 2) { px = t; pz = c; dz = 1; }
      if (side === 3) { px = -c; pz = t; dx = -1; }

      const chipEdge = new THREE.Vector3(px, chipY * 0.55, pz);
      const land = new THREE.Vector3(px + dx * 0.14, 0.005, pz + dz * 0.14);
      out.push(seg(chipEdge, land));

      // Manhattan trace: run outward, 90-degree turn, end at a via
      const runOut = 0.25 + rand() * (side % 2 === 0 ? 0.45 : 0.7);
      const turn = (rand() - 0.5) * 1.1;
      const mid = new THREE.Vector3(land.x + dx * runOut, 0.005, land.z + dz * runOut);
      const via = new THREE.Vector3(
        mid.x + (dz !== 0 ? turn : 0),
        0.005,
        mid.z + (dx !== 0 ? turn : 0),
      );
      polyline([land, mid, via], out);
      // Via marker: tiny diamond
      const v = 0.045;
      polyline([
        new THREE.Vector3(via.x - v, 0.005, via.z),
        new THREE.Vector3(via.x, 0.005, via.z - v),
        new THREE.Vector3(via.x + v, 0.005, via.z),
        new THREE.Vector3(via.x, 0.005, via.z + v),
      ], out, true);
    }
  }

  return out;
}

// --- Assembly -----------------------------------------------------------------

export interface ShapeSet {
  /** One Float32Array per shape, each segmentCount * 6 floats. */
  shapes: Float32Array[];
  segmentCount: number;
}

/** Pad every shape to a common segment count so any two can be lerped. */
export function assembleShapes(raw: Seg[][]): ShapeSet {
  const segmentCount = Math.max(...raw.map((r) => r.length));

  const shapes = raw.map((segsList) => {
    const arr = new Float32Array(segmentCount * 6);
    for (let i = 0; i < segmentCount; i++) {
      // Pad shorter shapes by cycling existing segments (overlaps are invisible)
      const sg = segsList[i % segsList.length];
      arr.set(sg, i * 6);
    }
    return arr;
  });

  return { shapes, segmentCount };
}

export function buildShapes(): ShapeSet {
  return assembleShapes([geodesic(), grandPiano(), gradCap(), circuitBoard()]);
}

export { mulberry32 };
