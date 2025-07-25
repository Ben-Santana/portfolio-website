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
  { name: "Tailwind", distance: 2.5, size: 0.5, speed: 0.01 },
  { name: "Java", distance: 3.2, size: 0.35, speed: 0.006 },
  { name: "PostgreSQL", distance: 5, size: 0.8, speed: 0.007 },
  { name: "Git", distance: 3.3, size: 0.6, speed: 0.008 },
  { name: "C/C++", distance: 4.1, size: 0.6, speed: 0.007 },
  { name: "Unity", distance: 2.5, size: 0.4, speed: 0.007 },
  { name: "Zsh", distance: 2.8, size: 0.35, speed: 0.007 }
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

function CenterLabel({ onClick }: { onClick: () => void }) {
  const labelRef = useRef<THREE.Mesh>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const { theme } = useTheme();
  const { camera } = useThree();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (labelRef.current && meshRef.current) {
      const center = new THREE.Vector3(0, 0, 0);
      const direction = center.clone().sub(camera.position).normalize();
      const labelPos = center.clone().add(direction.multiplyScalar(-1.5));
      
      // Animate scale on hover
      const targetScale = isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      labelRef.current.position.copy(labelPos);
      labelRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onClick={onClick}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
          color={theme === 'dark' ? '#c8c8c8' : '#393939'}
        />
      </mesh>
      <Text
        ref={labelRef}
        fontSize={0.2}
        font='/fonts/NeueHaasDisplay-Bold.ttf'
        color={theme === 'dark' ? '#111827' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {isHovered ? 'Return' : 'Skills'}
      </Text>
    </group>
  );
}

const SkillsTextDisplay = ({ onBack, theme }: { onBack: () => void, theme: string }) => {
  const skillsByCategory = {
    languages: ["Python", "Java", "C/C++", "TypeScript", "JavaScript", "C#"],
    technologies: ["React", "Next.js", "Node.js", "Three.js", "Tailwind", "Express", "Linux", "SQL", "OpenCV"],
    tools: ["Git", "PostgreSQL", "REST APIs", "Docker", "AWS", "Zsh"]
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <div className="max-w-3xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Skills & Technologies</h2>
        <div className="flex justify-center mb-8">
          <button 
            onClick={onBack}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Go to 3D View</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(skillsByCategory).map(([category, items]) => (
            <div key={category} className="select-none rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 capitalize">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill, i) => (
                  <span 
                    key={i}
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${theme === 'dark' 
                        ? 'bg-gray-800 text-gray-100' 
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function SkillsOrbit3D() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'3d' | 'text'>('text');

  const toggleView = () => {
    setViewMode(prev => prev === '3d' ? 'text' : '3d');
  };

  if (viewMode === 'text') {
    return <SkillsTextDisplay onBack={toggleView} theme={theme} />;
  }

  return (
    <div className="w-full h-[500px] user-select-none">
      <Canvas camera={{ position: [0, 6, 8], fov: 60 }}>
        <ambientLight intensity={3} />
        <pointLight position={[0, 0, 0]} />

        <CenterLabel onClick={toggleView} />

        {skills.map((skill, index) => (
          <OrbitingSkill key={index} skill={skill} />
        ))}

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
