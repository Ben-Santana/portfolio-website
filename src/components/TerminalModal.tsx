'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fileSystem, navigatePath, listDirectory, FileSystemItem } from './TerminalFileSystem';

export default function TerminalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<React.ReactNode[]>([]);
  const [input, setInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentPath, setCurrentPath] = useState('~');
  const [currentDir, setCurrentDir] = useState<FileSystemItem>(fileSystem);
  const router = useRouter();
  const endOfTerminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (endOfTerminalRef.current) {
      endOfTerminalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = () => {
    const trimmed = input.trim().toLowerCase().split(' ')[0];
    let response: React.ReactNode = '';
    switch (trimmed) {
      case 'help':
        response =
        <>
        <p>Available commands:</p>
          <ul className='list-disc pl-7'>
            <li>help</li>
            <li>about</li>
            <li>projects</li>
            <li>contact</li>
            <li>social</li>
            <li>clear</li>
            <li>exit</li>
            <li>sudo</li>
            <li>ls [dir] - List directory contents</li>
            <li>cd [dir] - Change directory</li>
            <li>pwd - Show current directory</li>
            <li>cat [file] - Show file contents</li>
          </ul>
        </>
        break;
      case 'ls':
        const targetDir = input.split(' ')[1] || '';
        if (targetDir) {
          const result = navigatePath(targetDir, currentPath, currentDir, fileSystem);
          if (result.success && result.newDir.type === 'directory') {
            const items = Object.values(result.newDir.children || {}).map((item: FileSystemItem, i) => (
              <span key={i} className={item.type === 'directory' ? 'text-blue-400' : ''}>
                {item.name}{item.type === 'directory' ? '/' : ''}
              </span>
            ));
            response = <div className="grid grid-cols-2 gap-1">{items}</div>;
          } else {
            response = `ls: ${result.error || 'Cannot access directory'}`;
          }
        } else {
          const items = Object.values(currentDir.children || {}).map((item: FileSystemItem, i) => (
            <span key={i} className={item.type === 'directory' ? 'text-blue-400' : ''}>
              {item.name}{item.type === 'directory' ? '/' : ''}
            </span>
          ));
          response = <div className="grid grid-cols-2 gap-1">{items}</div>;
        }
        break;

      case 'cd':
        const path = input.split(' ')[1] || '~';
        const result = navigatePath(path, currentPath, currentDir, fileSystem);
        if (path === 'projects') {
          setHistory((prev) => [...prev, `C:/Users/ben/${currentPath} ${input}`, 'Opening projects...']);
        setInput('');
        setTimeout(() => {
          onClose();
          router.push('/#projects');
        }, 500);
        return;
        }
        if (result.success) {
          setCurrentPath(result.newPath);
          setCurrentDir(result.newDir);
          response = '';
        } else {
          response = `cd: ${result.error || 'No such file or directory'}`;
        }
        break;

      case 'pwd':
        response = currentPath;
        break;

      case 'cat':
        const fileArg = input.split(' ')[1];
        if (!fileArg) {
          response = 'Usage: cat <file>';
          break;
        }
        
        // Try to find the file with or without .txt extension
        let file = currentDir.children?.[fileArg] || 
                  currentDir.children?.[`${fileArg}.txt`];
        
        // If not found in current directory and path includes /, try to navigate
        if (!file && fileArg.includes('/')) {
          const pathParts = fileArg.split('/');
          const fileName = pathParts.pop() || '';
          const dirPath = pathParts.join('/');
          
          const result = navigatePath(dirPath, currentPath, currentDir, fileSystem);
          if (result.success) {
            file = result.newDir.children?.[fileName] || 
                  result.newDir.children?.[`${fileName}.txt`];
          }
        }
        
        if (!file) {
          response = `cat: ${fileArg}: No such file or directory`;
        } else if (file.type === 'directory') {
          response = `cat: ${fileArg}: Is a directory`;
        } else {
          response = file.content || '';
        }
        break;

      case 'about':
        response = (<p><span className='font-bold'>Ben Santana</span> - CS Major @ WPI | Pianist | Boston, MA</p>);
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
      case '':
        response = ''
        break;
      default:
        response = `'${input}' is not recognized. Try "help"`;
    }

    setHistory((prev) => [...prev, `C:/Users/ben/${currentPath} ${input}`, response]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 dark:bg-black bg-white bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`dark:bg-gray-950 bg-white dark:text-white text-gray-900 rounded-md shadow-lg text-md flex flex-col ${isMaximized ? 'w-full h-full' : 'w-full max-w-2xl max-h-[80vh] overflow-y-auto'}`}
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
          >
            <div className={`flex items-center justify-between p-2 bg-gray-800 ${isMaximized ? '' : 'rounded-t-md'}`}>
              <div className="flex items-center space-x-2">
                <button onClick={onClose} className="w-3 h-3 bg-red-500 rounded-full"></button>
                <button onClick={onClose} className="w-3 h-3 bg-yellow-500 rounded-full"></button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="w-3 h-3 bg-green-500 rounded-full"></button>
              </div>
              <span className="text-md text-gray-400">Terminal</span>
              <div className="w-14"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2 font-mono text-md">
                {history.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap break-words">
                    {line}
                  </div>
                ))}
                <div className="flex items-center">
                  <span className='mr-1'>C:/Users/ben/{currentPath}</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200"
                    autoFocus
                    spellCheck={false}
                  />
                </div>
                <div ref={endOfTerminalRef} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
