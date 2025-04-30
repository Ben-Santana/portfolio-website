'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';
import ContactSection from '../components/ContactSection';
import SkillsSection from '../components/SkillsSection';
import LoadingScreen from '../components/LoadingScreen'; // make sure the path is correct

export default function Home() {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <main className="min-h-screen">
      {!loadingDone && <LoadingScreen onFinish={() => setLoadingDone(true)} />}
      {loadingDone && (
        <>
          <Navbar />
          <HeroSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </>
      )}
    </main>
  );
}
