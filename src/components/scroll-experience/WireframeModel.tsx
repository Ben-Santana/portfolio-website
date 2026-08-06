'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildShapes, mulberry32, ShapeSet } from './shapes';

export interface ModelParams {
  /** Continuous shape index into the active shape set. */
  shape: number;
  /** Stroke draw-in progress, 0..1. */
  draw: number;
  /** Extra scroll-driven Y rotation in radians. */
  spin: number;
  /** Horizontal offset so the model can sit opposite the active text panel. */
  x: number;
  /** Normalized mouse position for parallax, -1..1. */
  mouseX: number;
  mouseY: number;
  /** 1 = normal size; animates down on click. */
  clickScale: number;
  /** 0 = accent/base color; 1 = full white on click. */
  clickWhite: number;
  /** When >= 0, morph directly between morphFrom and morphTo (skips intermediates). */
  morphFrom: number;
  morphTo: number;
  /** 0..1 progress for a direct morph. */
  morphT: number;
}

export function createModelParams(): ModelParams {
  return {
    shape: 0,
    draw: 0,
    spin: 0,
    x: 0,
    mouseX: 0,
    mouseY: 0,
    clickScale: 1,
    clickWhite: 0,
    morphFrom: -1,
    morphTo: 0,
    morphT: 0,
  };
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export default function WireframeModel({
  params,
  theme,
  scale = 1,
  shapeSet,
  accentColors,
  float = false,
}: {
  params: ModelParams;
  theme: 'light' | 'dark';
  scale?: number;
  /** Defaults to the hero shape set (geodesic, piano, grad cap, circuit board). */
  shapeSet?: ShapeSet;
  /** Optional per-shape accent colors; the material cross-fades between them. */
  accentColors?: string[];
  /** Gentle bob/wobble idle motion with pulsing dots. */
  float?: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const lineMat = useRef<THREE.LineBasicMaterial>(null!);
  const pointMat = useRef<THREE.PointsMaterial>(null!);

  const accents = useMemo(
    () => (accentColors ? accentColors.map((c) => new THREE.Color(c)) : null),
    [accentColors],
  );
  const baseColor = useMemo(
    () => new THREE.Color(theme === 'dark' ? '#e5e5e5' : '#171717'),
    [theme],
  );
  const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);
  const frameColor = useRef(new THREE.Color());

  const { shapes, segmentCount, offsets, noiseDirs } = useMemo(() => {
    const set = shapeSet ?? buildShapes();
    const rand = mulberry32(42);
    const offs = new Float32Array(set.segmentCount);
    const dirs = new Float32Array(set.segmentCount * 3);
    for (let i = 0; i < set.segmentCount; i++) {
      offs[i] = rand() * 0.35;
      const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      dirs[i * 3] = v.x;
      dirs[i * 3 + 1] = v.y;
      dirs[i * 3 + 2] = v.z;
    }
    return { ...set, offsets: offs, noiseDirs: dirs };
  }, [shapeSet]);

  const { lineGeo, pointGeo, posAttr } = useMemo(() => {
    const positions = new Float32Array(segmentCount * 6);
    positions.set(shapes[0]);
    const attr = new THREE.BufferAttribute(positions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', attr);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', attr);
    return { lineGeo: lg, pointGeo: pg, posAttr: attr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothed values so 3D motion eases even when scroll jumps
  const smooth = useRef({ shape: 0, x: 0, mx: 0, my: 0 });

  useFrame((state, delta) => {
    const k = Math.min(1, delta * 7);
    const sm = smooth.current;
    const directMorph = params.morphFrom >= 0;
    const shapeTarget = directMorph ? params.morphTo : params.shape;

    // Snap on large jumps (e.g. after a direct morph) so we don't drift through
    // every intermediate shape index on the way to the target.
    if (Math.abs(shapeTarget - sm.shape) > 1.01) {
      sm.shape = shapeTarget;
    } else {
      sm.shape += (shapeTarget - sm.shape) * k;
    }

    sm.x += (params.x - sm.x) * k;
    sm.mx += (params.mouseX - sm.mx) * Math.min(1, delta * 4);
    sm.my += (params.mouseY - sm.my) * Math.min(1, delta * 4);

    const last = shapes.length - 1;
    let i0: number;
    let i1: number;
    let t: number;

    if (directMorph) {
      i0 = Math.max(0, Math.min(last, params.morphFrom));
      i1 = Math.max(0, Math.min(last, params.morphTo));
      t = params.morphT;
    } else {
      i0 = Math.max(0, Math.min(last, Math.floor(sm.shape)));
      i1 = Math.min(last, i0 + 1);
      t = sm.shape - i0;
    }

    const from = shapes[i0];
    const to = shapes[i1];
    const arr = posAttr.array as Float32Array;
    const draw = params.draw;

    for (let j = 0; j < segmentCount; j++) {
      // Per-segment staggered morph progress with scatter arc mid-flight
      const tj = smoothstep(clamp01((t - offsets[j]) / 0.65));
      const arc = Math.sin(Math.PI * tj) * 0.45;
      const nx = noiseDirs[j * 3] * arc;
      const ny = noiseDirs[j * 3 + 1] * arc;
      const nz = noiseDirs[j * 3 + 2] * arc;

      const base = j * 6;
      const ax = from[base] + (to[base] - from[base]) * tj + nx;
      const ay = from[base + 1] + (to[base + 1] - from[base + 1]) * tj + ny;
      const az = from[base + 2] + (to[base + 2] - from[base + 2]) * tj + nz;
      let bx = from[base + 3] + (to[base + 3] - from[base + 3]) * tj + nx;
      let by = from[base + 4] + (to[base + 4] - from[base + 4]) * tj + ny;
      let bz = from[base + 5] + (to[base + 5] - from[base + 5]) * tj + nz;

      // Draw-in: segment strokes from endpoint A toward B in sequence
      if (draw < 1) {
        const dj = clamp01((draw * 1.2 - j / segmentCount) * 6);
        bx = ax + (bx - ax) * dj;
        by = ay + (by - ay) * dj;
        bz = az + (bz - az) * dj;
      }

      arr[base] = ax;
      arr[base + 1] = ay;
      arr[base + 2] = az;
      arr[base + 3] = bx;
      arr[base + 4] = by;
      arr[base + 5] = bz;
    }
    posAttr.needsUpdate = true;
    lineGeo.computeBoundingSphere();

    // Idle rotation + scroll spin + mouse parallax.
    // Shape 3 (circuit board) gets a steeper pitch so the top plane reads clearly.
    const g = group.current;
    const time = state.clock.elapsedTime;
    const pcbTiltBlend = smoothstep(clamp01((sm.shape - 2) / 1));
    const tiltX = 0.1 + pcbTiltBlend * 0.42;
    g.rotation.y = time * 0.12 + params.spin + sm.mx * 0.25;
    g.rotation.x = tiltX + sm.my * 0.18;
    g.position.x = sm.x;
    g.scale.setScalar(scale * params.clickScale);

    if (float) {
      g.position.y = Math.sin(time * 0.8) * 0.09;
      g.rotation.z = Math.sin(time * 0.5) * 0.05;
    }

    // Cross-fade the accent color along with the shape morph
    if (lineMat.current && pointMat.current) {
      const c = frameColor.current;
      if (accents) {
        c.lerpColors(
          accents[Math.min(i0, accents.length - 1)],
          accents[Math.min(i1, accents.length - 1)],
          t,
        );
        c.lerp(baseColor, 0.22);
      } else {
        c.copy(baseColor);
      }
      if (params.clickWhite > 0) c.lerp(whiteColor, params.clickWhite);
      lineMat.current.color.copy(c);
      pointMat.current.color.copy(c);
    }

    // Dots fade in with the draw progress
    if (pointMat.current) {
      pointMat.current.opacity = 0.85 * clamp01(draw * 1.5);
      if (float) pointMat.current.size = 0.03 + (Math.sin(time * 2.2) + 1) * 0.007;
    }
    if (lineMat.current) lineMat.current.opacity = 0.8;
  });

  const color = theme === 'dark' ? '#e5e5e5' : '#171717';

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial ref={lineMat} color={color} transparent opacity={0.8} />
      </lineSegments>
      <points geometry={pointGeo} frustumCulled={false}>
        <pointsMaterial ref={pointMat} color={color} size={0.03} sizeAttenuation transparent opacity={0} />
      </points>
    </group>
  );
}
