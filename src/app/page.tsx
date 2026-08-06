'use client';
import Navbar from '../components/Navbar';
import ProjectsSection from '../components/ProjectsSection';
import ContactSection from '../components/ContactSection';
import ScrollExperience from '../components/scroll-experience/ScrollExperience';
import ClickSpark from '@/components/ClickSpark';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
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
        <Navbar />
        <ScrollExperience />
        <ProjectsSection />
        <ContactSection />
      </main>
    </ClickSpark>
  );
}
