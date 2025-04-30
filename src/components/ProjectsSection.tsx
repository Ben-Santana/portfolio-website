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
    imageUrl: "/project-images/exodus.jpg",
    technologies: ["Python", "Agent", "Kali Linux"],
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
    link: "https://github.com/Ben-Santana/AI-Dungeon-Master"
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
    description: "A custom machine learning library built from scratch for a deeper understanding of AI fundamentals.",
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
              className="group relative h-96 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(project.link, '_blank')}
            >
              {/* Full-size image */}
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover transition duration-300 group-hover:blur-sm"
              />
            
              {/* Text content overlay */}
              <div className="absolute inset-0 p-6 bg-black/60 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 text-white flex flex-col justify-end">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="bg-gray-200/30 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  className="text-blue-300 hover:text-blue-200 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project →
                </a>
              </div>
            </motion.div>
            ))}
          </div>

          {/* More Projects Button */}
          <div className='text-center mt-12 w-full'>
                <a
                  href="https://github.com/Ben-Santana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-gray-700 dark:text-gray-200 px-6 py-3 rounded-md font-medium hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                >
                  More Projects on GitHub →
                </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
