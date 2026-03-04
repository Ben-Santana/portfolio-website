'use client';

import Navbar from '@/components/Navbar';
import SkillsDrive from '@/components/SkillsDrive';

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />
      <div className="hidden md:block h-[calc(100vh-4rem)] pt-16">
        <SkillsDrive />
      </div>
      <div className="flex md:hidden flex-col items-center justify-center h-[calc(100vh-4rem)] pt-16 px-6 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 dark:text-neutral-500 mb-4">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg">this page is not available on mobile</p>
      </div>
    </main>
  );
}
