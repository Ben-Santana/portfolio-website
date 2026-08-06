'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { LuAnvil, LuMail, LuHouse, LuTerminal, LuBook } from 'react-icons/lu';
import TerminalModal from './TerminalModal';

interface NavIconProps {
  children: React.ReactNode;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  className?: string;
}

const NavIcon = ({ children, label, onClick, href, className = '' }: NavIconProps) => {
  const classes = `flex items-center justify-center transition-colors duration-200 hover:text-neutral-900 dark:hover:text-white ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label} title={label}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-label={label} title={label}>
      {children}
    </button>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const iconClass = 'h-5 w-5';

  const [scrollProgress, setScrollProgress] = useState(isHome ? 0 : 1);

  useEffect(() => {
    const handleScroll = () => {
      if (!isHome) {
        setScrollProgress(1);
        return;
      }

      const projectsEl = document.getElementById('projects');
      if (!projectsEl) return;

      const distanceIntoProjects = 64 - projectsEl.getBoundingClientRect().top;
      const progress = Math.min(Math.max(distanceIntoProjects / 200, 0), 1);
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHome]);

  return (
    <>
      <nav
        className="fixed w-full z-50"
        style={{
          backgroundColor: scrollProgress === 0
            ? 'transparent'
            : theme === 'dark'
              ? `rgba(23, 23, 23, ${scrollProgress})`
              : `rgba(255, 255, 255, ${scrollProgress})`,
          backdropFilter: scrollProgress > 0 ? `blur(${scrollProgress * 8}px)` : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">

            {!isHome && (
              <Link
                href="/"
                className="absolute left-0 hidden md:block text-xl font-bold text-neutral-800 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-white transition-colors"
              >
                ben santana
              </Link>
            )}

            {/* desktop nav icons */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-8 text-neutral-600 dark:text-neutral-300">
              {/* <NavIcon 
                href="/#achievements"
                label="credentials"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('achievements');
                  if (element) {
                    element.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }
                }}
              >
                <LuBook className={iconClass} />
              </NavIcon>
              
              <NavIcon href="/#projects" label="projects">
                <LuAnvil className={iconClass} />
              </NavIcon> */}
              
              <NavIcon href="/#contact" label="contact">
                <LuMail className={iconClass} />
              </NavIcon>
              
              <NavIcon 
                onClick={() => setTerminalOpen(true)}
                label="terminal"
              >
                <LuTerminal className={iconClass} />
              </NavIcon>
            </div>

            {/* theme toggle */}
            <div className="ml-auto hidden md:flex items-center">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                  }}
                  className="p-2 rounded-lg"
                  aria-label="Toggle theme"
                >
                  <div className="w-4 h-4 rounded-full bg-black dark:bg-white" />
                </button>
              </motion.div>
            </div>

            {/* mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col items-center justify-center px-4 pt-4 pb-6 space-y-4 bg-white dark:bg-neutral-900 transition-colors border-t dark:border-neutral-800 text-center">
              <Link
                href="/#about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-2 dark:text-white text-neutral-600 hover:text-neutral-900 dark:hover:text-white"
              >
                <LuHouse className={iconClass} />
                <span className="text-sm">Home</span>
              </Link>
              <Link
                href="#achievements"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  const element = document.getElementById('achievements');
                  if (element) {
                    element.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }
                }}
                className="flex items-center gap-2 p-2 dark:text-white text-neutral-600 hover:text-neutral-900 dark:hover:text-white"
              >
                <LuBook className={iconClass} />
                <span className="text-sm">Credentials</span>
              </Link>
              <Link
                href="/#projects"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-2 dark:text-white text-neutral-600 hover:text-neutral-900 dark:hover:text-white"
              >
                <LuAnvil className={iconClass} />
                <span className="text-sm">Projects</span>
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-2 dark:text-white text-neutral-600 hover:text-neutral-900 dark:hover:text-white"
              >
                <LuMail className={iconClass} />
                <span className="text-sm">Contact</span>
              </Link>

              {/* theme toggle */}
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                  setIsMenuOpen(false);
                }}
                className="p-2 rounded-lg"
                aria-label="Toggle theme"
              >
                <div className="w-4 h-4 rounded-full bg-black dark:bg-white" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* terminal modal */}
      <TerminalModal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </>
  );
}
