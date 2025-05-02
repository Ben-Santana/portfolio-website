'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function TerminalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleCommand = () => {
    const trimmed = input.trim().toLowerCase();
    let response: React.ReactNode = '';

    switch (trimmed) {
      case 'help':
        response =
        <>
        <p>Available commands:</p>
        <ul className='list-disc'>
            <li>- help</li>
            <li>- about</li>
            <li>- projects</li>
            <li>- contact</li>
            <li>- social</li>
            <li>- clear</li>
            <li>- exit</li>
            <li>- sudo</li>
        </ul>
        </>
        break;
      case 'about':
        response = (<p><span className='font-bold'>Ben Santana</span> - CS Major @ WPI | AI, ML & Robotics Enthusiast</p>);
        break;
      case 'projects':
        setHistory((prev) => [...prev, `> ${input}`, 'Opening projects...']);
        setInput('');
        setTimeout(() => {
          onClose();
          router.push('/#projects');
        }, 500);
        return;
      case 'contact':
        response = 'Email: basantana@wpi.edu';
        break;
      case 'social':
        response = (
          <div>
            GitHub:{' '}
            <a
              href="https://github.com/Ben-Santana"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 hover:text-blue-300"
            >
              github.com/Ben-Santana
            </a>
            <br />
            LinkedIn:{' '}
            <a
              href="https://linkedin.com/in/benjamin-a-santana"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-400 hover:text-blue-300"
            >
              linkedin.com/in/benjamin-a-santana
            </a>
          </div>
        );
        break;
      case 'sudo':
        response = 'Permission denied: Ben is the root user.';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        setHistory([]);
        setInput('');
        onClose();
        return;
      case 'the cake is a lie':
        response = '…and so is this terminal.';
        break;
      default:
        response = `'${input}' is not recognized. Try "help"`;
    }

    setHistory((prev) => [...prev, `C:/Users/ben> ${input}`, response]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 dark:bg-black bg-white bg-opacity-80 dark:bg-opacity-80 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl dark:bg-gray-950 bg-white dark:text-white text-gray-900 p-6 rounded-md shadow-lg font-mono text-md relative">
        <div className="overflow-y-auto max-h-96 pr-1 scrollbar-hide"> 
          {history.map((line, idx) => (
            <div key={idx}>
              {line}
            </div>
          ))}
          <div className="flex items-center mt-1">
            <span className="mr-2 dark:text-white text-gray-900">{'C:/Users/ben>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none text-gray-800 dark:text-gray-200 w-full"
              autoFocus
            />
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-800 dark:text-gray-400 hover:text-red-500 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}
