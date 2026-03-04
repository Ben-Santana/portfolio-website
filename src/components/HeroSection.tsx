'use client';
// Animation imports removed
import { Typewriter } from 'react-simple-typewriter';

export default function HeroSection() {

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 transition-colors duration-300 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
            hey, i&apos;m ben
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-2 max-w-2xl mx-auto">
            <span>i&apos;m a</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              <Typewriter
                words={[' software engineer', ' pianist', 'n embedded systems engineer', 'lways curious', ' WPI student']}
                loop={true}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1200}
              />
            </span>
          </p>
          <p className="text-md text-neutral-500 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            who enjoys building intelligent systems, simulations, and hardware integrations.
          </p>
          <div className="mt-2">
            <a
              href="#projects"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all duration-200 shadow-sm hover:shadow"
            >
              my projects
              <svg 
                className="w-3.5 h-3.5 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

  );
}
