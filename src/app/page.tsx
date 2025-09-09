'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';
import ContactSection from '../components/ContactSection';
import SkillsSection from '../components/SkillsSection';
// LoadingScreen import removed
import AwardsSection from '../components/AwardsSection';
import EducationSection from '../components/EducationSection';
import ClickSpark from '@/components/ClickSpark';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  // Loading screen bypassed
  const [loadingDone] = useState(true);
  const { theme } = useTheme();

  return (
    <ClickSpark
      sparkColor={theme === 'dark' ? '#fff' : '#000'}
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <main className="min-h-screen">
        {/* Loading screen bypassed */}
        {loadingDone && (
          <>
            <Navbar />
            <HeroSection />
            <section id="achievements" className="py-20 bg-white dark:bg-neutral-900 transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col space-y-12 lg:space-y-0 lg:flex-row lg:space-x-12">
                  <AwardsSection />
                  <EducationSection />
                </div>
              </div>
            </section>

            <SkillsSection />
            <ProjectsSection />
            <ContactSection />
          </>
        )}
      </main>
    </ClickSpark>
  );
}
