export type FileSystemItem = {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  children?: Record<string, FileSystemItem>;
};

export type NavigateResult = {
  success: boolean;
  newPath: string;
  newDir: FileSystemItem;
  error?: string;
};

export const fileSystem: FileSystemItem = {
  type: 'directory',
  name: '~',
  children: {
    projects: {
      type: 'directory',
      name: 'projects',
      children: {
        'portfolio': {
          type: 'directory',
          name: 'portfolio',
          children: {}
        },
        'other-project': {
          type: 'directory',
          name: 'other-project',
          children: {}
        }
      }
    },
    skills: {
      type: 'directory',
      name: 'skills',
      children: {
        'languages.txt': {
          type: 'file',
          name: 'languages.txt',
          content: 'Python, Java, C/C++, TypeScript, JavaScript, C#'
        },
        'technologies.txt': {
          type: 'file',
          name: 'technologies.txt',
          content: 'React, Next.js, Node.js, Three.js, Tailwind, Express, Linux, SQL, OpenCV'
        },
        'tools.txt': {
          type: 'file',
          name: 'tools.txt',
          content: 'Git, PostgreSQL, LLMs, REST APIs, Docker, AWS, Zsh'
        }
      }
    },
    hobbies: {
      type: 'directory',
      name: 'hobbies',
      children: {
        'music.txt': {
          type: 'file',
          name: 'music.txt',
          content: 'Piano: 10yrs ~ Studied at New England Conservatory\nGuitar: 4yrs ~ Self-taught'
        },
        'art.txt': {
          type: 'file',
          name: 'art.txt',
          content: 'Painting, Photography'
        }
      }
    }
  }
};

export const navigatePath = (path: string, currentPath: string, currentDir: FileSystemItem, root: FileSystemItem): NavigateResult => {
  // Handle home directory
  if (path === '~' || path === '') {
    return {
      success: true,
      newPath: '~',
      newDir: root
    };
  }

  // Handle relative paths
  const pathSegments = path.split('/').filter(segment => segment !== '');
  let newCurrentDir = currentDir;
  
  // Handle parent directory
  if (path === '..') {
    if (currentPath === '~') {
      return {
        success: false,
        newPath: currentPath,
        newDir: currentDir,
        error: 'Already at root directory'
      };
    }
    
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '~';
    return navigatePath(parentPath, currentPath, root, root);
  }

  // Navigate through path segments
  for (const segment of pathSegments) {
    if (segment === '.') continue;
    
    if (segment === '..') {
      // Handle parent directory in path
      const pathParts = currentPath.split('/');
      if (pathParts.length > 1) {
        pathParts.pop();
        currentPath = pathParts.join('/') || '~';
      }
      // Reset to root to navigate from there
      newCurrentDir = root;
      for (const part of currentPath.split('/').filter(p => p)) {
        if (part === '~') continue;
        newCurrentDir = newCurrentDir.children?.[part] as FileSystemItem;
      }
      continue;
    }

    if (!newCurrentDir.children?.[segment]) {
      return {
        success: false,
        newPath: currentPath,
        newDir: currentDir,
        error: `No such file or directory: ${path}`
      };
    }

    const nextDir = newCurrentDir.children?.[segment];
    if (nextDir.type === 'file') {
      return {
        success: false,
        newPath: currentPath,
        newDir: currentDir,
        error: `Not a directory: ${path}`
      };
    }

    newCurrentDir = nextDir;
    currentPath = currentPath === '~' ? `~/${segment}` : `${currentPath}/${segment}`;
  }

  return {
    success: true,
    newPath: currentPath,
    newDir: newCurrentDir
  };
};

export const listDirectory = (dir: FileSystemItem): string[] => {
  if (!dir.children) return [];
  return Object.values(dir.children).map(item => 
    item.type === 'directory' ? `${item.name}/` : item.name
  );
};