'use client';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Hi, I'm Ben 
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Software Engineer Student interested in AI, Machine Learning & Simulations
          </p>
          <motion.div whileHover={{ scale: 1.00 }} whileTap={{ scale: 0.95 }}>
            <a
              href="#projects"
              className="bg-gray-600 dark:bg-gray-500 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              View My Work
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
