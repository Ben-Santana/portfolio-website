'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface Skill {
  name: string;
  distance: number;
  size: number;
  speed: number;
}

const skills = [
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
    const angleRef = useRef(Math.random() * 2 * Math.PI);
    const { camera, mouse, raycaster } = useThree();
    const [showLabel, setShowLabel] = useState(false);
    const { theme } = useTheme();
  
    const axis = useRef(new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize());
  
    const baseVector = useRef(new THREE.Vector3(skill.distance, 0, 0));
  
    useFrame(() => {
      angleRef.current += skill.speed;
      const rotated = baseVector.current.clone().applyAxisAngle(axis.current, angleRef.current);
      meshRef.current.position.set(rotated.x, rotated.y, rotated.z);
      const ndcMouse = new THREE.Vector2(mouse.x, mouse.y);
      raycaster.setFromCamera(ndcMouse, camera);
      const point = new THREE.Vector3();
      raycaster.ray.closestPointToPoint(meshRef.current.position, point);
      const dist = point.distanceTo(meshRef.current.position);
  
      const isClose = dist < 3;
      setShowLabel(isClose);
  
      const targetScale = isClose ? 1.4 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });
  
    return (
      <mesh ref={meshRef}>
        <sphereGeometry args={[skill.size, 32, 32]} />
        <meshStandardMaterial color={theme === 'dark' ? '#FFFFFF' : '#595959'} />
        <Html center>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showLabel ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className={`text-xs font-medium pointer-events-none ${
              theme === 'dark' ? 'text-gray-700 font-bold' : 'text-gray-200'
            }`}
          >
            {skill.name}
          </motion.div>
        </Html>
      </mesh>
    );
  }  

export default function SkillsOrbit3D() {
  const { theme } = useTheme();
  return (
    <div className="w-full h-[500px] user-select-none">
        <Canvas camera={{ position: [0, 5, 7], fov: 60 }}>
            <ambientLight intensity={3} />
            <pointLight position={[0, 0, 0]} />

            {/* center sphere */}
            <mesh>
                <sphereGeometry args={[0.7, 32, 32]} />
                <meshStandardMaterial color={theme === 'dark' ? '#c8c8c8' : '#393939'} />
            </mesh>

            {/* center label */}
            <Html center position={[0, 0, 0]}>
                <div className="text-sm dark:text-gray-800 font-bold text-white pointer-events-none select-none">Skills</div>
            </Html>

            {/* orbiting skills */}
            {skills.map((skill, index) => (
                <OrbitingSkill key={index} skill={skill} />
            ))}

            <OrbitControls enableZoom={false} />    
        </Canvas>
    </div>
  );
}
