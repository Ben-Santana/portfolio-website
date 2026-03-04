'use client';
import Image from 'next/image';
import Link from 'next/link';
import { projects } from '@/data/projects';

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20 bg-white dark:bg-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900 dark:text-white">my projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Link
                key={index}
                href={`/projects/${project.slug}`}
                className="group relative h-96 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-neutral-800 block cursor-pointer"
              >
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover transition duration-300 group-hover:blur-md group-hover:scale-105"
              />

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-5xl font-bebas text-white">{project.title}</h3>
              </div>

              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start -translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-white/90 text-sm font-medium">Read More →</span>
                <span className="text-2xl font-bebas text-white/60">{project.year}</span>
              </div>
            </Link>
            ))}
          </div>

          <div className='text-center mt-12 w-full'>
                <a
                  href="https://github.com/Ben-Santana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-neutral-700 dark:text-neutral-200 px-6 py-3 rounded-md font-medium hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
                >
                  more projects on GitHub →
                </a>
          </div>
        </div>
      </div>
    </section>
  );
}
