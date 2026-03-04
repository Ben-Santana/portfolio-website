'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { Text } from '@react-three/drei';

const ROAD_CONTROL_POINTS: [number, number][] = [
  [-12, 0],
  [-4, 0],
  [4, 0],
  [12, 0],
  [20, -4],
  [24, -14],
  [20, -28],
  [10, -38],
  [0, -48],
  [-8, -60],
  [-4, -74],
  [8, -82],
  [20, -88],
  [28, -100],
  [24, -114],
  [14, -122],
  [0, -124],
  [-14, -118],
  [-24, -108],
  [-30, -94],
  [-32, -78],
  [-30, -62],
  [-26, -48],
  [-22, -34],
  [-20, -18],
  [-20, -6],
];

const ROAD_WIDTH = 5;
const ROAD_SAMPLES = 400;
const CENTER_LINE_WIDTH = 0.08;
function buildRoadCurve() {
  const pts = ROAD_CONTROL_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.2);
}

const SKILLS = [
  'Python', 'React', 'Next.js', 'Tailwind', 'Java',
  'PostgreSQL', 'Git', 'C/C++', 'TypeScript', 'Node.js',
  'Docker', 'AWS', 'Linux', 'Three.js', 'REST APIs',
  'Express', 'OpenCV', 'LLMs', 'SQL', 'JavaScript',
  'C#', 'Zsh',
];

const CAR_ACCEL = 0.005;
const CAR_MAX_SPEED = 0.083;
const CAR_FRICTION = 0.97;
const CAR_TURN_SPEED = 0.01;

interface Keys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

function useKeys(): Keys {
  const [keys, setKeys] = useState<Keys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      setKeys((prev) => ({
        ...prev,
        forward: k === 'w' || k === 'arrowup' ? true : prev.forward,
        backward: k === 's' || k === 'arrowdown' ? true : prev.backward,
        left: k === 'a' || k === 'arrowleft' ? true : prev.left,
        right: k === 'd' || k === 'arrowright' ? true : prev.right,
      }));
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      setKeys((prev) => ({
        ...prev,
        forward: k === 'w' || k === 'arrowup' ? false : prev.forward,
        backward: k === 's' || k === 'arrowdown' ? false : prev.backward,
        left: k === 'a' || k === 'arrowleft' ? false : prev.left,
        right: k === 'd' || k === 'arrowright' ? false : prev.right,
      }));
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return keys;
}

function CabinGeometry() {
  const geo = useMemo(() => {
    const bw = 0.8, tw = 0.8, bd = 0.7, td = 0.45, h = 0.35;
    const hh = h / 2;
    const vertices = new Float32Array([
      -bw/2, -hh, -bd/2,  bw/2, -hh, -bd/2,  bw/2, -hh, bd/2,  -bw/2, -hh, bd/2,
      -tw/2, hh, -td/2,  tw/2, hh, -td/2,  tw/2, hh, td/2,  -tw/2, hh, td/2,
    ]);
    const indices = [
      0,1,2, 0,2,3, 4,6,5, 4,7,6,
      0,4,5, 0,5,1, 2,6,7, 2,7,3,
      0,3,7, 0,7,4, 1,5,6, 1,6,2,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  return <primitive object={geo} attach="geometry" />;
}

function Car({ keys, carRef }: { keys: Keys; carRef: React.RefObject<THREE.Group> }) {
  const { theme } = useTheme();
  const speedRef = useRef(0);
  const rotationRef = useRef(0);

  useFrame(() => {
    if (keys.forward) speedRef.current = Math.min(speedRef.current + CAR_ACCEL, CAR_MAX_SPEED);
    if (keys.backward) speedRef.current = Math.max(speedRef.current - CAR_ACCEL, -CAR_MAX_SPEED * 0.5);
    speedRef.current *= CAR_FRICTION;

    if (Math.abs(speedRef.current) > 0.005) {
      const turnDir = speedRef.current > 0 ? 1 : -1;
      if (keys.left) rotationRef.current += CAR_TURN_SPEED * turnDir;
      if (keys.right) rotationRef.current -= CAR_TURN_SPEED * turnDir;
    }

    carRef.current.rotation.y = rotationRef.current;
    carRef.current.position.x -= Math.sin(rotationRef.current) * speedRef.current;
    carRef.current.position.z -= Math.cos(rotationRef.current) * speedRef.current;
  });

  const carColor = theme === 'dark' ? '#ffffff' : '#2a2a2a';
  const wheelColor = theme === 'dark' ? '#cccccc' : '#111111';

  return (
    <>
      <group ref={carRef} position={[0, 0.2, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[1.0, 0.25, 1.4]} />
          <meshBasicMaterial color={carColor} />
        </mesh>
        <mesh position={[0, 0.48, -0.05]}>
          <CabinGeometry />
          <meshBasicMaterial color={carColor} />
        </mesh>
        <mesh position={[-0.35, -0.02, 0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 8]} />
          <meshBasicMaterial color={wheelColor} />
        </mesh>
        <mesh position={[0.35, -0.02, 0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 8]} />
          <meshBasicMaterial color={wheelColor} />
        </mesh>
        <mesh position={[-0.35, -0.02, -0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 8]} />
          <meshBasicMaterial color={wheelColor} />
        </mesh>
        <mesh position={[0.35, -0.02, -0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 8]} />
          <meshBasicMaterial color={wheelColor} />
        </mesh>
      </group>
      <FollowCamera target={carRef} />
    </>
  );
}

function FollowCamera({ target }: { target: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree();
  const offset = useMemo(() => new THREE.Vector3(6, 10, 6), []);
  const initialized = useRef(false);

  useFrame(() => {
    if (!target.current) return;
    const carPos = target.current.position;

    if (!initialized.current) {
      camera.position.set(carPos.x + offset.x, offset.y, carPos.z + offset.z);
      camera.lookAt(carPos.x, 0, carPos.z);
      initialized.current = true;
    }

    camera.position.x = carPos.x + offset.x;
    camera.position.z = carPos.z + offset.z;
  });

  return null;
}

function buildStripGeometry(
  curve: THREE.CatmullRomCurve3,
  samples: number,
  halfWidth: number,
  y: number,
  lateralOffset = 0,
) {
  const points = curve.getSpacedPoints(samples);
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const t = i / samples;
    const tan = curve.getTangentAt(Math.min(t, 0.9999));
    const nx = -tan.z;
    const nz = tan.x;
    const p = points[i];
    const cx = p.x + nx * lateralOffset;
    const cz = p.z + nz * lateralOffset;

    positions.push(
      cx + nx * halfWidth, y, cz + nz * halfWidth,
      cx - nx * halfWidth, y, cz - nz * halfWidth,
    );

    if (i < points.length - 1) {
      const vi = i * 2;
      indices.push(vi, vi + 2, vi + 1, vi + 1, vi + 2, vi + 3);
    }
  }

  const last = (points.length - 1) * 2;
  indices.push(last, 0, last + 1, last + 1, 0, 1);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return geo;
}

function RoadSurface() {
  const { theme } = useTheme();
  const roadColor = theme === 'dark' ? '#2a2a2a' : '#a0a0a0';

  const geometry = useMemo(
    () => buildStripGeometry(buildRoadCurve(), ROAD_SAMPLES, ROAD_WIDTH / 2, 0.01),
    [],
  );

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={roadColor} side={THREE.DoubleSide} />
    </mesh>
  );
}

function CenterLine() {
  const { theme } = useTheme();
  const lineColor = theme === 'dark' ? '#d4a017' : '#ffffff';
  const gap = 0.12;
  const leftGeo = useMemo(
    () => buildStripGeometry(buildRoadCurve(), ROAD_SAMPLES, CENTER_LINE_WIDTH / 2, 0.02, gap / 2 + CENTER_LINE_WIDTH / 2),
    [],
  );
  const rightGeo = useMemo(
    () => buildStripGeometry(buildRoadCurve(), ROAD_SAMPLES, CENTER_LINE_WIDTH / 2, 0.02, -(gap / 2 + CENTER_LINE_WIDTH / 2)),
    [],
  );

  return (
    <>
      <mesh geometry={leftGeo}>
        <meshBasicMaterial color={lineColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshBasicMaterial color={lineColor} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function SkillSigns() {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#ffffff' : '#222222';

  const signs = useMemo(() => {
    const curve = buildRoadCurve();
    const result: { text: string; x: number; z: number }[] = [];

    for (let i = 0; i < SKILLS.length; i++) {
      const t = (i + 0.5) / SKILLS.length;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const nx = -tangent.z;
      const nz = tangent.x;
      const side = i % 2 === 0 ? 1 : -1;
      const offset = ROAD_WIDTH / 2 + 3.5;

      result.push({
        text: SKILLS[i],
        x: point.x + nx * offset * side,
        z: point.z + nz * offset * side,
      });
    }
    return result;
  }, []);

  return (
    <group>
      {signs.map((sign, i) => (
        <Text
          key={i}
          position={[sign.x, 0.01, sign.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1.4}
          font="/fonts/NeueHaasDisplay-Bold.ttf"
          color={textColor}
          anchorX="center"
          anchorY="middle"
        >
          {sign.text}
        </Text>
      ))}
    </group>
  );
}

function Floor() {
  const { theme } = useTheme();
  const floorColor = theme === 'dark' ? '#171717' : '#ffffff';

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial color={floorColor} />
    </mesh>
  );
}

function HintOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
      <div className="text-neutral-500 dark:text-neutral-400 text-sm bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-full">
        wasd or arrow keys to drive
      </div>
      <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 text-sm bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-full">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        this might be a bit laggy on some devices
      </div>
    </div>
  );
}

export default function SkillsDrive() {
  const keys = useKeys();
  const { theme } = useTheme();
  const carRef = useRef<THREE.Group>(null!);

  return (
    <div className="relative w-full h-full">
      <Canvas
        orthographic
        camera={{ position: [6, 10, 6], zoom: 60, near: 0.1, far: 500 }}
        style={{ background: theme === 'dark' ? '#171717' : '#ffffff' }}
        gl={{ toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      >
        <Floor />
        <RoadSurface />
        <CenterLine />
        <SkillSigns />
        <Car keys={keys} carRef={carRef} />
      </Canvas>
      <HintOverlay />
    </div>
  );
}
