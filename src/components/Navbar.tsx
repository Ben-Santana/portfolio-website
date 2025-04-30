'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { LuAnvil, LuMail, LuHouse } from 'react-icons/lu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const iconClass = 'h-5 w-5';

  return (
    <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-16">

          {/* Centered nav icons */}
          {/* Centered nav icons (desktop only) */}
<div className="absolute left-1/2 -translate-x-1/2 hidden md:flex space-x-8 text-gray-600 dark:text-gray-300">
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href="/#about" className="hover:text-gray-900 dark:hover:text-white">
                <LuHouse className={iconClass} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href="/#projects" className="hover:text-gray-900 dark:hover:text-white">
                <LuAnvil className={iconClass} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link href="/#contact" className="hover:text-gray-900 dark:hover:text-white">
                <LuMail className={iconClass} />
              </Link>
            </motion.div>
          </div>

          {/* Right: Theme toggle */}
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

          {/* Mobile menu button (still left-aligned) */}
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 transition-colors border-t dark:border-gray-800">
            <Link href="/#about" onClick={() => setIsMenuOpen(false)} className="block p-2 dark:text-white light:text-gray-600">
              <LuHouse className={iconClass} />
            </Link>
            <Link href="/#projects" onClick={() => setIsMenuOpen(false)} className="block p-2 dark:text-white light:text-gray-600">
              <LuAnvil className={iconClass} />
            </Link>
            <Link href="/#contact" onClick={() => setIsMenuOpen(false)} className="block p-2 dark:text-white light:text-gray-600">
              <LuMail className={iconClass} />
            </Link>
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
  );
}
