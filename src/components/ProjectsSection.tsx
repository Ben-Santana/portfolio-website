'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  link: string;
}

const projects: Project[] = [
  {
    title: "Exodus",
    description: "An agentic pentesting suite that fuses LLMs with tools in Kali Linux to perform attacks on networks.",
    imageUrl: "/project-images/exodus.jpg",
    technologies: ["Agentic", "Kali Linux", "Python"],
    link: "https://www.sundai.club/projects/592eb5af-cd78-4449-91b6-37dc7298a093"
  },
  {
    title: "Intelligent D&D Narrator",
    description: "React application that guides you through a Dungeons and Dragons campaign using MCP.",
    imageUrl: "/project-images/Dungeons.jpg",
    technologies: ["React", "LLM", "Prisma", "PostgreSQL", "TypeScript", "Next.js", "Tailwind CSS"],
    link: "https://github.com/Ben-Santana/AI-Dungeon-Master"
  },
  {
    title: "Wireless Security Scanner",
    description: "Software-defined radio application for wireless protocol detection and security analysis",
    imageUrl: "/project-images/wireless-security.jpg",
    technologies: ["C++", "Software-Defined Radio", "Signal Processing", "FFT", "Spectrogram"],
    link: "https://github.com/Ben-Santana/RF-Security"
  },
  {
    title: "Tomo",
    description: "A classic space invaders inspired game with an evolving codebase powered by an LLM. Each level introduces new game mechanics for a unique experience.",
    imageUrl: "/project-images/tomo.jpg",
    technologies: ["Python", "LLM", "Game Development"],
    link: "https://github.com/Ben-Santana/Tomo"
  },
  {
    title: "Custom 3D Renderer",
    description: "Implementation of perspective projection and matrix-based rotation for 3D rendering.",
    imageUrl: "/project-images/3d-renderer.jpg",
    technologies: ["Java", "3D Graphics", "Linear Algebra"],
    link: "https://github.com/Ben-Santana/Custom-3DRenderer"
  },
  {
    title: "Flock Simulation",
    description: "A visually stunning simulation of fish schools and bird flocks behavior 🐟🐠 🦆🦆",
    imageUrl: "/project-images/flock.jpg",
    technologies: ["Python", "Simulation", "Boids Algorithm"],
    link: "https://github.com/Ben-Santana/Flock-Simulation"
  }
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function ProjectsSection() {
  const [selected, setSelected] = useState(0);

  return (
    <section id="projects" className="py-20 bg-white dark:bg-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={containerVariants}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900 dark:text-white">My Projects</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex md:flex-col md:w-1/4 gap-4 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0">
              {projects.map((project, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-md text-sm md:text-base border transition-colors text-left ${
                    selected === index
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {project.title}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-96 rounded-lg shadow-lg overflow-hidden"
                >
                  <Image
                    src={projects[selected].imageUrl}
                    alt={projects[selected].title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 p-6 bg-black/60 dark:bg-black/50 text-white flex flex-col justify-end">
                    <h3 className="text-2xl font-semibold mb-2">{projects[selected].title}</h3>
                    <p className="mb-4">{projects[selected].description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {projects[selected].technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="bg-neutral-200/30 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <a
                      href={projects[selected].link}
                      className="text-neutral-300 hover:text-neutral-200 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Project →
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className='text-center mt-12 w-full'>
                <a
                  href="https://github.com/Ben-Santana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-neutral-700 dark:text-neutral-200 px-6 py-3 rounded-md font-medium hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  More Projects on GitHub →
                </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

