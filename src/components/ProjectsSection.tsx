'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
    imageUrl: "/project-images/slime-mold.jpg",
    technologies: ["Python", "Simulation", "Complex Systems"],
    link: "https://www.sundai.club/projects/592eb5af-cd78-4449-91b6-37dc7298a093"
  },
  {
    title: "Tomo",
    description: "A classic space invaders inspired game with an evolving codebase powered by an LLM. Each level introduces new game mechanics for a unique experience.",
    imageUrl: "/project-images/tomo.jpg",
    technologies: ["Python", "LLM", "Game Development"],
    link: "https://github.com/Ben-Santana/Tomo"
  },
  {
    title: "Generative Dungeons And Dragons",
    description: "React application that generates Dungeons and Dragons campaigns using an LLM.",
    imageUrl: "/project-images/Dungeons.jpg",
    technologies: ["React", "LLM", "Prisma", "PostgreSQL", "TypeScript", "Next.js", "Tailwind CSS"],
    link: "https://github.com/Ben-Santana/Ai_Number_Generator"
  },
  {
    title: "Flock Simulation",
    description: "A visually stunning simulation of fish schools and bird flocks behavior 🐟🐠 🦆🦆",
    imageUrl: "/project-images/flock.jpg",
    technologies: ["Python", "Simulation", "Boids Algorithm"],
    link: "https://github.com/Ben-Santana/Flock-Simulation"
  },
  {
    title: "Machine Learning Library",
    description: "A custom machine learning library built from scratch for deep understanding of AI fundamentals.",
    imageUrl: "/project-images/ml-lib.jpg",
    technologies: ["Python", "Machine Learning", "Neural Networks"],
    link: "https://github.com/Ben-Santana/Machine-Learning-Library"
  },
  {
    title: "Custom 3D Renderer",
    description: "Implementation of perspective projection and matrix-based rotation for 3D rendering.",
    imageUrl: "/project-images/3d-renderer.jpg",
    technologies: ["Java", "3D Graphics", "Linear Algebra"],
    link: "https://github.com/Ben-Santana/Custom-3DRenderer"
  }
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">My Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors"
              >
                <div className="relative h-48">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.link}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Project →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
