'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { LuAnvil, LuMail, LuHouse } from 'react-icons/lu';
import TerminalModal from './TerminalModal'; // Make sure this import is correct

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const [terminalOpen, setTerminalOpen] = useState(false);

  const iconClass = 'h-5 w-5';

  return (
    <>
      <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="mr-4 hidden md:block"
            >
              <button
                onClick={() => setTerminalOpen(true)}
                className="dark:text-white text-gray-800 font-mono text-xl hover:text-gray-500 transition-colors animate-bounce"
                title="Open Terminal"
              >
                &gt;
              </button>
            </motion.div>


            {/* desktop nav icons */}
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
