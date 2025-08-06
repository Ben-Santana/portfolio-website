'use client';
import { useTheme } from '../context/ThemeContext';
import SkillsOrbit3D from './SkillsOrbit';

const skills = {
  languages: ["Python", "Java", "C/C++", "TypeScript", "JavaScript", "C#"],
  technologies: ["React", "Next.js", "Node.js", "Three.js", "Tailwind", "Express", "Linux", "SQL", "OpenCV"],
  tools: ["Git", "PostgreSQL", "LLMs", "REST APIs", "Docker", "AWS", "Zsh"]
};

const SkillCategory = ({ title, skills, theme }: { title: string; skills: string[]; theme: string }) => (
  <div className="mb-8">
    <h3 className="text-base font-normal text-neutral-600 dark:text-neutral-400 mb-3 tracking-wide">
      {title}
    </h3>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span 
          key={index}
          className={`px-3 py-1.5 rounded-full text-sm font-medium
            ${theme === 'dark' 
              ? 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700' 
              : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
            } transition-colors`}
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
);

export default function SkillsSection() {
  const { theme } = useTheme();

  return (
    <section id="skills" className="bg-white dark:bg-neutral-900 py-12 md:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-t border-neutral-200 dark:border-neutral-700" />
      </div>
      
      {/* Mobile View - Categorized Tags */}
      <div className="md:hidden py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
            Skills & Technologies
          </h2>
          <div className="space-y-6 px-4">
            <SkillCategory 
              title="Languages" 
              skills={skills.languages} 
              theme={theme} 
            />
            <SkillCategory 
              title="Technologies" 
              skills={skills.technologies} 
              theme={theme} 
            />
            <SkillCategory 
              title="Tools & Platforms" 
              skills={skills.tools} 
              theme={theme} 
            />
          </div>
        </div>
      </div>

      {/* Desktop View - 3D Orbit */}
      <div className="hidden md:block">
        <SkillsOrbit3D />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-t border-neutral-200 dark:border-neutral-700" />
      </div>
    </section>
  );
}