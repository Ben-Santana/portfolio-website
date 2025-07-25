'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { LuAnvil, LuMail, LuHouse, LuTerminal, LuBook } from 'react-icons/lu';
import TerminalModal from './TerminalModal';

interface NavIconProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  className?: string;
  title?: string;
}

const NavIcon = ({ children, onClick, href, className = '', title }: NavIconProps) => {
  const content = (
    <div className="relative group flex flex-col items-center px-1 -mx-1" title={title}>
      <motion.div 
        className="relative z-10"
        whileHover={{ y: -2 }} 
        whileTap={{ y: 0 }}
      >
        {children}
      </motion.div>
      <motion.div 
        className="absolute -bottom-1.5 left-1 right-1 w-auto h-0.5 bg-current transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100"
        initial={false}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`hover:text-gray-900 dark:hover:text-white ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`hover:text-gray-900 dark:hover:text-white ${className}`}>
      {content}
    </button>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const [terminalOpen, setTerminalOpen] = useState(false);

  const iconClass = 'h-5 w-5';

  return (
    <>
      <nav className="fixed w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">




            {/* desktop nav icons */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-8 text-gray-600 dark:text-gray-300">
              <NavIcon 
                href="#achievements"
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
              
              <NavIcon href="/#projects">
                <LuAnvil className={iconClass} />
              </NavIcon>
              
              <NavIcon href="/#contact">
                <LuMail className={iconClass} />
              </NavIcon>
              
              <NavIcon 
                onClick={() => setTerminalOpen(true)}
                title="Open Terminal"
              >
                <LuTerminal className={iconClass} />
              </NavIcon>
            </div>

            {/* theme toggle */}
            <div className="ml-auto hidden md:flex items-center">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={toggleTheme}
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
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            <div className="flex flex-col items-center justify-center px-4 pt-4 pb-6 space-y-4 bg-white dark:bg-gray-900 transition-colors border-t dark:border-gray-800 text-center">
              <Link
                href="/#about"
                onClick={() => setIsMenuOpen(false)}
                className="block p-2 dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white"
              >
                <LuHouse className={iconClass} />
              </Link>
              <Link
                href="/#projects"
                onClick={() => setIsMenuOpen(false)}
                className="block p-2 dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white"
              >
                <LuAnvil className={iconClass} />
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
                className="block p-2 dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white"
              >
                <LuBook className={iconClass} />
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block p-2 dark:text-white text-gray-600 hover:text-gray-900 dark:hover:text-white"
              >
                <LuMail className={iconClass} />
              </Link>

              {/* theme toggle */}
              <button
                onClick={() => {
                  toggleTheme();
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
