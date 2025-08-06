'use client';
import { FaEnvelope, FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 py-8" id="contact">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <div className="flex space-x-6 mb-4">
          <a
            href="mailto:basantana@wpi.edu"
            className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <FaEnvelope size={24} />
          </a>
          <a
            href="https://github.com/Ben-Santana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/benjamin-a-santana/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://www.instagram.com/bsantana06/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            <FaInstagram size={24} />
          </a>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} Ben Santana. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
