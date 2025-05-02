'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { Text } from '@react-three/drei';

interface Skill {
  name: string;
  distance: number;
  size: number;
  speed: number;
}

const skills: Skill[] = [
  { name: "Python", distance: 2, size: 0.5, speed: 0.009 },
  { name: "React", distance: 3, size: 0.4, speed: 0.008 },
  { name: "Next.js", distance: 3.5, size: 0.5, speed: 0.007 },
  { name: "LLMs", distance: 4, size: 0.6, speed: 0.009 },
  { name: "Tailwind", distance: 2.5, size: 0.5, speed: 0.01 },
  { name: "Java", distance: 3.2, size: 0.35, speed: 0.006 },
  { name: "PostgreSQL", distance: 5, size: 0.8, speed: 0.007 },
  { name: "Git", distance: 3.3, size: 0.6, speed: 0.008 },
];

function OrbitingSkill({ skill }: { skill: Skill }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const textRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(Math.random() * 2 * Math.PI);
  const { camera, mouse, raycaster } = useThree();
  const { theme } = useTheme();
  const [labelOpacity, setLabelOpacity] = useState(0);
  const scaleRef = useRef(1);

  const axis = useRef(
    new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
  );
  const baseVector = useRef(new THREE.Vector3(skill.distance, 0, 0));

  useFrame(() => {
    // Rotate position
    angleRef.current += skill.speed;
    const rotated = baseVector.current.clone().applyAxisAngle(axis.current, angleRef.current);
    meshRef.current.position.set(rotated.x, rotated.y, rotated.z);

    // Mouse proximity
    const ndcMouse = new THREE.Vector2(mouse.x, mouse.y);
    raycaster.setFromCamera(ndcMouse, camera);
    const point = new THREE.Vector3();
    raycaster.ray.closestPointToPoint(meshRef.current.position, point);
    const dist = point.distanceTo(meshRef.current.position);
    const isClose = dist < 3;

    // Smooth scale and opacity
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, isClose ? 1.6 : 1, 0.1);
    meshRef.current.scale.setScalar(scaleRef.current);

    setLabelOpacity((prev) =>
      THREE.MathUtils.lerp(prev, isClose ? 1 : 0, 0.1)
    );

    // Label positioning and camera-facing orientation
    if (textRef.current) {
      const camPos = camera.position.clone();
      const direction = meshRef.current.position.clone().sub(camPos).normalize();
      const labelPos = meshRef.current.position.clone().add(direction.multiplyScalar(-skill.size - 0.6));
      textRef.current.position.copy(labelPos);
      textRef.current.quaternion.copy(camera.quaternion); // camera-aligned

      // Opacity settings
      if (textRef.current.material instanceof THREE.MeshBasicMaterial) {
        textRef.current.material.opacity = labelOpacity;
        textRef.current.material.transparent = true;
        textRef.current.material.depthWrite = false;
      }
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[skill.size, 32, 32]} />
        <meshStandardMaterial color={theme === 'dark' ? '#FFFFFF' : '#595959'} />
      </mesh>
      <Text
        ref={textRef}
        fontSize={0.2}
        font='/fonts/NeueHaasDisplay-Bold.ttf'
        color={theme === 'dark' ? '#111827' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {skill.name}
      </Text>
    </>
  );
}

function CenterLabel() {
  const labelRef = useRef<THREE.Mesh>(null!);
  const { theme } = useTheme();
  const { camera } = useThree();

  useFrame(() => {
    if (labelRef.current) {
      const center = new THREE.Vector3(0, 0, 0);
      const direction = center.clone().sub(camera.position).normalize();
      const labelPos = center.clone().add(direction.multiplyScalar(-1.5));
      labelRef.current.position.copy(labelPos);
      labelRef.current.quaternion.copy(camera.quaternion); // camera-aligned
    }
  });

  return (
    <Text
      ref={labelRef}
      fontSize={0.3}
      font='/fonts/NeueHaasDisplay-Bold.ttf'
      color={theme === 'dark' ? '#111827' : '#ffffff'}
      anchorX="center"
      anchorY="middle"
    >
      Skills
    </Text>
  );
}

export default function SkillsOrbit3D() {
  const { theme } = useTheme();

  return (
    <div className="w-full h-[500px] user-select-none">
      <Canvas camera={{ position: [0, 6, 8], fov: 60 }}>
        <ambientLight intensity={3} />
        <pointLight position={[0, 0, 0]} />

        {/* center sphere */}
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color={theme === 'dark' ? '#c8c8c8' : '#393939'} />
        </mesh>

        <CenterLabel />

        {skills.map((skill, index) => (
          <OrbitingSkill key={index} skill={skill} />
        ))}

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
