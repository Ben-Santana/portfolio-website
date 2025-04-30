'use client';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

export default function HeroSection() {

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300 select-none">
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
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 max-w-2xl mx-auto">
            <span>I'm a </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              <Typewriter
                words={['Software Engineer', "Pianist", 'Simulation Developer', 'Lifelong Learner', 'Student']}
                loop={true}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1200}
              />
            </span>
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Passionate about building intelligent systems, simulations, and cool ideas.
          </p>
          <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}>
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
