'use client';

// Animation imports removed

const educationDetails = [
  {
    text: 'GPA: 3.9/4.0',
  },
  {
    text: 'Hackathon Manager, ACM Student Branch',
  },
  {
    text: 'Charles O. Thompson Scholar',
  },
];

export default function EducationSection() {
  return (
    <div className="w-full lg:w-1/2 select-none flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">education</h2>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg w-full flex-1">
        <div className="mb-6 text-left border-b border-neutral-200 dark:border-neutral-700 pb-4">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Worcester Polytechnic Institute</h3>
          <p className="text-md text-neutral-500 dark:text-neutral-400">BS, Computer Science 2024-2028</p>
        </div>
        <div className="flex flex-col gap-2">
          {educationDetails.map((detail, index) => (
            <div key={index}>
              <p className="text-lg text-neutral-800 dark:text-neutral-200">{detail.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
