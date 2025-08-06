'use client';

import { motion } from 'framer-motion';
import { LuExternalLink } from 'react-icons/lu';

const awards = [
  {
    id: 1,
    title: 'HackUMASS XII 2nd Place',
    issuer: 'HackUMASS XII',
    year: '2024',
    description: 'Second place in HackUMASS XII hackathon with over 500 participants.',
    link: 'https://devpost.com/basantana',
  },
  {
    id: 2,
    title: 'Dean\'s List',
    issuer: 'Worcester Polytechnic Institute',
    year: '(All Semesters)',
    description: '',
  }
];

export default function AwardsSection() {
  return (
    <div className="w-full lg:w-1/2 select-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Awards</h2>
        </motion.div>

        <div className="flex flex-col gap-8">
          {awards.map((award, index) => {
            const card = (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{award.title}</h3>
                    {award.link && (
                      <LuExternalLink className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{award.issuer} • {award.year}</p>
                </div>
                <p className="text-neutral-600 dark:text-neutral-300">{award.description}</p>
              </motion.div>
            );

            if (award.link) {
              return (
                <a href={award.link} key={award.id} target="_blank" rel="noopener noreferrer">
                  {card}
                </a>
              );
            }

            return <div key={award.id}>{card}</div>;
          })}
        </div>
    </div>
  );
}
