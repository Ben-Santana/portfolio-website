'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fileSystem, navigatePath, FileSystemItem } from './TerminalFileSystem';
import { useTheme } from '../context/ThemeContext';

const projectSlugMap: Record<string, string> = {
  'tomo': 'tomo',
  'exodus': 'exodus',
  'gen-d-and-d': 'dnd-narrator',
  '3d-renderer': '3d-renderer',
  'wireless-security': 'wireless-security',
  'flock-sim': 'flock-simulation',
};

const COMMANDS: Array<[string, string]> = [
  ['help', 'show this list'],
  ['about', 'who is ben?'],
  ['whoami', 'who are you?'],
  ['neofetch', 'system info'],
  ['projects', 'jump to projects'],
  ['contact', 'get in touch'],
  ['social', 'github + linkedin'],
  ['theme', 'toggle dark / light'],
  ['ls [dir]', 'list directory'],
  ['cd [dir]', 'change directory'],
  ['cat [file]', 'show file contents'],
  ['pwd', 'current directory'],
  ['echo [text]', 'say it back'],
  ['history', 'command history'],
  ['clear', 'clear the screen'],
  ['exit', 'close the terminal'],
];

const BANNER = `\
 _
| |__   ___ _ __
| '_ \\ / _ \\ '_ \\
| |_) |  __/ | | |
|_.__/ \\___|_| |_|`;

function Prompt({ path }: { path: string }) {
  return (
    <span className="shrink-0 select-none">
      <span className="text-emerald-600 dark:text-emerald-400">ben@portfolio</span>
      <span className="text-neutral-400 dark:text-neutral-500">:</span>
      <span className="text-sky-600 dark:text-sky-400">{path}</span>
      <span className="text-neutral-400 dark:text-neutral-500">$&nbsp;</span>
    </span>
  );
}

function Neofetch() {
  return (
    <div className="flex gap-6 items-start py-1">
      <pre className="leading-tight text-emerald-600 dark:text-emerald-400 select-none">{BANNER}</pre>
      <div className="space-y-0.5">
        <p>
          <span className="text-emerald-600 dark:text-emerald-400">ben</span>@
          <span className="text-emerald-600 dark:text-emerald-400">portfolio</span>
        </p>
        <p className="text-neutral-400 dark:text-neutral-500">----------------</p>
        <p><span className="font-bold">os:</span> portfolio-os 2.0</p>
        <p><span className="font-bold">host:</span> WPI · Worcester, MA</p>
        <p><span className="font-bold">kernel:</span> cs-major (gpa 3.9)</p>
        <p><span className="font-bold">shell:</span> bensh</p>
        <p><span className="font-bold">languages:</span> typescript, python, c++, java</p>
        <p><span className="font-bold">audio:</span> piano, mostly</p>
        <p><span className="font-bold">uptime:</span> {new Date().getFullYear() - 2004} years</p>
      </div>
    </div>
  );
}

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
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [booted, setBooted] = useState(false);
  const draftRef = useRef('');
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (endOfTerminalRef.current) {
      endOfTerminalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Boot sequence: staggered banner on first open
  useEffect(() => {
    if (!isOpen || booted) return;
    setBooted(true);
    const lines: React.ReactNode[] = [
      <pre key="banner" className="leading-tight text-emerald-600 dark:text-emerald-400 select-none">{BANNER}</pre>,
      <p key="version" className="text-neutral-500 dark:text-neutral-400">portfolio-os v2.0 — © {new Date().getFullYear()} ben santana</p>,
      <p key="hint">type <span className="font-bold">help</span> to get started.</p>,
      <p key="pad">&nbsp;</p>,
    ];
    const timers = lines.map((line, i) =>
      window.setTimeout(() => setHistory((prev) => [...prev, line]), 140 * i),
    );
    return () => timers.forEach(clearTimeout);
  }, [isOpen, booted]);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  const resetSession = () => {
    setHistory([]);
    setInput('');
    setCurrentPath('~');
    setCurrentDir(fileSystem);
    setCmdHistory([]);
    setHistIndex(-1);
    setBooted(false);
  };

  const echoLine = (cmd: string) => (
    <div>
      <Prompt path={currentPath} />
      {cmd}
    </div>
  );

  const handleCommand = () => {
    const raw = input;
    const trimmedFull = raw.trim().toLowerCase();
    const trimmed = trimmedFull.split(' ')[0];
    const rest = raw.trim().slice(trimmed.length).trim();

    if (raw.trim()) {
      setCmdHistory((prev) => [...prev, raw]);
    }
    setHistIndex(-1);
    draftRef.current = '';

    let response: React.ReactNode = '';

    // Full-phrase easter eggs first
    if (trimmedFull === 'the cake is a lie') {
      setHistory((prev) => [...prev, echoLine(raw), '…and so is this terminal.']);
      setInput('');
      return;
    }

    switch (trimmed) {
      case 'help':
        response = (
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 py-1">
            {COMMANDS.map(([cmd, desc]) => (
              <div key={cmd} className="contents">
                <span className="text-emerald-600 dark:text-emerald-400">{cmd}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{desc}</span>
              </div>
            ))}
          </div>
        );
        break;

      case 'ls': {
        const targetDir = rest || '';
        const dirToList = targetDir
          ? navigatePath(targetDir, currentPath, currentDir, fileSystem)
          : { success: true as const, newDir: currentDir, newPath: currentPath };
        if ('success' in dirToList && dirToList.success && dirToList.newDir.type === 'directory') {
          const items = Object.values(dirToList.newDir.children || {}).map((item: FileSystemItem, i) => (
            <span key={i} className={item.type === 'directory' ? 'text-sky-600 dark:text-sky-400' : ''}>
              {item.name}
              {item.type === 'directory' ? '/' : ''}
            </span>
          ));
          response = <div className="grid grid-cols-2 gap-1">{items}</div>;
        } else {
          response = `ls: ${('error' in dirToList && dirToList.error) || 'Cannot access directory'}`;
        }
        break;
      }

      case 'cd': {
        const path = rest || '~';
        const result = navigatePath(path, currentPath, currentDir, fileSystem);
        if (result.success) {
          const pathMatch = result.newPath.match(/^~\/projects\/(.+)$/);
          if (pathMatch && projectSlugMap[pathMatch[1]]) {
            const slug = projectSlugMap[pathMatch[1]];
            setHistory((prev) => [...prev, echoLine(raw), `Opening ${pathMatch[1]}…`]);
            setInput('');
            setTimeout(() => {
              onClose();
              router.push(`/projects/${slug}`);
            }, 500);
            return;
          }
          setCurrentPath(result.newPath);
          setCurrentDir(result.newDir);
          response = '';
        } else {
          response = `cd: ${result.error || 'No such file or directory'}`;
        }
        break;
      }

      case 'pwd':
        response = currentPath;
        break;

      case 'cat': {
        const fileArg = rest;
        if (!fileArg) {
          response = 'Usage: cat <file>';
          break;
        }
        let file = currentDir.children?.[fileArg] || currentDir.children?.[`${fileArg}.txt`];
        if (!file && fileArg.includes('/')) {
          const pathParts = fileArg.split('/');
          const fileName = pathParts.pop() || '';
          const dirPath = pathParts.join('/');
          const result = navigatePath(dirPath, currentPath, currentDir, fileSystem);
          if (result.success) {
            file = result.newDir.children?.[fileName] || result.newDir.children?.[`${fileName}.txt`];
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
      }

      case 'about':
        response = (
          <p>
            <span className="font-bold">Ben Santana</span> — CS Major @ WPI | Pianist | Boston, MA
          </p>
        );
        break;

      case 'whoami':
        response = 'you? a visitor with excellent taste in portfolios.';
        break;

      case 'neofetch':
        response = <Neofetch />;
        break;

      case 'projects':
        setHistory((prev) => [...prev, echoLine(raw), 'Opening projects…']);
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
              className="underline text-sky-600 dark:text-sky-400 hover:opacity-70"
            >
              github.com/Ben-Santana
            </a>
            <br />
            LinkedIn:{' '}
            <a
              href="https://linkedin.com/in/benjamin-a-santana"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sky-600 dark:text-sky-400 hover:opacity-70"
            >
              linkedin.com/in/benjamin-a-santana
            </a>
          </div>
        );
        break;

      case 'theme':
        toggleTheme();
        response = 'flipping the lights…';
        break;

      case 'echo':
        response = rest || '';
        break;

      case 'history':
        response = (
          <div>
            {cmdHistory.concat(raw.trim() ? [raw] : []).map((c, i) => (
              <p key={i}>
                <span className="text-neutral-400 dark:text-neutral-500 mr-3">{i + 1}</span>
                {c}
              </p>
            ))}
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
        setInput('');
        onClose();
        return;

      case '':
        response = '';
        break;

      default:
        response = (
          <p>
            bensh: command not found: {trimmed}. try <span className="font-bold">help</span>
          </p>
        );
    }

    setHistory((prev) => [...prev, echoLine(raw), response]);
    setInput('');
  };

  const getCompletions = (partial: string): string[] => {
    const commands = COMMANDS.map(([c]) => c.split(' ')[0]);
    const parts = partial.split(' ');

    if (parts.length <= 1) {
      return commands.filter((c) => c.startsWith(parts[0]));
    }

    const cmd = parts[0];
    if (!['cd', 'ls', 'cat'].includes(cmd)) return [];

    const arg = parts.slice(1).join(' ');
    const lastSlash = arg.lastIndexOf('/');

    let searchDir = currentDir;
    let prefix = '';

    if (lastSlash !== -1) {
      const dirPath = arg.substring(0, lastSlash) || '/';
      prefix = arg.substring(0, lastSlash + 1);
      const result = navigatePath(dirPath, currentPath, currentDir, fileSystem);
      if (!result.success || result.newDir.type !== 'directory') return [];
      searchDir = result.newDir;
    }

    const fragment = arg.substring(lastSlash + 1);
    if (!searchDir.children) return [];

    return Object.values(searchDir.children)
      .filter((item: FileSystemItem) => item.name.startsWith(fragment))
      .map((item: FileSystemItem) => {
        const name = item.type === 'directory' ? `${item.name}/` : item.name;
        return `${cmd} ${prefix}${name}`;
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      if (histIndex === -1) draftRef.current = input;
      const next = histIndex === -1 ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(cmdHistory[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex === -1) return;
      const next = histIndex + 1;
      if (next >= cmdHistory.length) {
        setHistIndex(-1);
        setInput(draftRef.current);
      } else {
        setHistIndex(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completions = getCompletions(input);
      if (completions.length === 1) {
        setInput(completions[0]);
      } else if (completions.length > 1) {
        let common = completions[0];
        for (const c of completions) {
          while (!c.startsWith(common)) {
            common = common.slice(0, -1);
          }
        }
        if (common.length > input.length) {
          setInput(common);
        } else {
          setHistory((prev) => [
            ...prev,
            echoLine(input),
            <div key={`completions-${prev.length}`} className="grid grid-cols-3 gap-1">
              {completions.map((c, i) => (
                <span key={i}>{c.split(' ').pop()}</span>
              ))}
            </div>,
          ]);
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 dark:bg-black bg-white bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`dark:bg-neutral-950 bg-white dark:text-neutral-100 text-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col ${
              isMaximized ? 'w-full h-full' : 'w-full max-w-2xl h-[70vh] rounded-lg'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              focusInput();
            }}
          >
            {/* Title bar */}
            <div
              className={`flex items-center justify-between px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 ${
                isMaximized ? '' : 'rounded-t-lg'
              }`}
            >
              <div className="flex items-center space-x-2">
                {/* red: close and reset session */}
                <button
                  onClick={() => {
                    resetSession();
                    onClose();
                  }}
                  aria-label="Close terminal"
                  className="w-3 h-3 bg-red-500 rounded-full hover:brightness-90"
                />
                {/* yellow: minimize (close, keep session) */}
                <button
                  onClick={onClose}
                  aria-label="Minimize terminal"
                  className="w-3 h-3 bg-yellow-500 rounded-full hover:brightness-90"
                />
                {/* green: maximize */}
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  aria-label="Maximize terminal"
                  className="w-3 h-3 bg-green-500 rounded-full hover:brightness-90"
                />
              </div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 select-none">
                ben@portfolio: {currentPath}
              </span>
              <div className="w-14" />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 cursor-text font-terminal text-sm" onClick={focusInput}>
              <div className="space-y-1.5">
                {history.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap break-words">
                    {line}
                  </div>
                ))}

                {/* Input line with block caret */}
                <div className="relative flex flex-wrap items-center">
                  <Prompt path={currentPath} />
                  <span className="whitespace-pre-wrap break-all">{input}</span>
                  <span
                    aria-hidden
                    className="terminal-caret inline-block w-[0.55em] h-[1.2em] translate-y-[0.1em] bg-neutral-800 dark:bg-neutral-200"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full opacity-0 cursor-text"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    aria-label="Terminal input"
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
