export interface Project {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  githubLink: string;
  videoUrl?: string;
  year: string;
}

export const projects: Project[] = [
  {
    slug: "arena",
    title: "ARena",
    description:
      "ARena is a shared AR experience built for stadiums and live venues",
    imageUrl: "/project-images/arena.png",
    technologies: ["Unity", "AR", "Game Development", 'C#'],
    githubLink: "https://github.com/Ben-Santana/Arena",
    videoUrl: "https://www.youtube.com/watch?v=PHGPq9pHwsA",
    year: "2025",
  },
  {
    slug: "dnd-narrator",
    title: "Intelligent D&D Narrator",
    description:
      "React application that guides you through a Dungeons and Dragons campaign using MCP.",
    imageUrl: "/project-images/Dungeons.jpg",
    technologies: [
      "React",
      "LLM",
      "Prisma",
      "PostgreSQL",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
    ],
    githubLink: "https://github.com/Ben-Santana/AI-Dungeon-Master",
    year: "2023",
  },
  {
    slug: "wireless-security",
    title: "Wireless Security Scanner",
    description:
      "Software-defined radio application for wireless protocol detection and security analysis",
    imageUrl: "/project-images/wireless-security.jpg",
    technologies: [
      "C++",
      "Software-Defined Radio",
      "Signal Processing",
      "FFT",
      "Spectrogram",
    ],
    githubLink: "https://github.com/Ben-Santana/RF-Security",
    year: "2025",
  },
  {
    slug: "tomo",
    title: "Tomo",
    description:
      "A classic space invaders inspired game with an evolving codebase powered by an LLM. Each level introduces new game mechanics for a unique experience.",
    imageUrl: "/project-images/tomo.jpg",
    technologies: ["Python", "LLM", "Game Development"],
    githubLink: "https://github.com/Ben-Santana/Tomo",
    year: "2024",
  },
  {
    slug: "lights",
    title: "Immersive Living Room",
    description:
      "Launchpad controlled light and video installation for electronic music performances",
    imageUrl: "/project-images/livingroom.webp",
    technologies: ["Python", "Network Hardware", "UDP", "Audio"],
    githubLink: "https://github.com/Ben-Santana/lightboard",
    // videoUrl: "/project-images/livingroom.mp4",
    year: "2023",
  },
  {
    slug: "exodus",
    title: "Exodus",
    description:
      "An agentic pentesting suite that fuses LLMs with tools in Kali Linux to perform attacks on networks.",
    imageUrl: "/project-images/exodus.webp",
    technologies: ["Agentic", "Kali Linux", "Python"],
    githubLink:
      "https://www.sundai.club/projects/592eb5af-cd78-4449-91b6-37dc7298a093",
    year: "2025",
  },
  {
    slug: "proc-gen",
    title: "Procedurally Animated Lizard",
    description:
      "Small project to learn about splines, procedural animation, and inverse kinematics.",
    imageUrl: "/project-images/proc-gen.png",
    technologies: ["Python", "Simulation Development"],
    githubLink: "https://github.com/Ben-Santana/Procedural-Animation",
    year: "2024",
  },
  {
    slug: "flock-simulation",
    title: "Flock Simulation",
    description:
      "A visually stunning simulation of fish schools and bird flocks behavior",
    imageUrl: "/project-images/flock.jpg",
    technologies: ["Python", "Simulation", "Boids Algorithm"],
    githubLink: "https://github.com/Ben-Santana/Flock-Simulation",
    videoUrl: "https://www.youtube.com/embed/67p6HOcLXDs",
    year: "2023",
  },
  {
    slug: "slime-sim",
    title: "Slime Mold Simulation",
    description:
      "A visually stunning simulation of slime mold behaviour",
    imageUrl: "/project-images/slime.png",
    technologies: ["Python", "Simulation"],
    githubLink: "https://github.com/Ben-Santana/Slime-Mold-Simulation",
    videoUrl: "https://www.youtube.com/embed/kW8oHoRLOc4",
    year: "2022",
  },
  // {
  //   slug: "3d-renderer",
  //   title: "Custom 3D Renderer",
  //   description:
  //     "Implementation of perspective projection and matrix-based rotation for 3D rendering.",
  //   imageUrl: "/project-images/3d-renderer.jpg",
  //   technologies: ["Java", "3D Graphics", "Linear Algebra"],
  //   githubLink: "https://github.com/Ben-Santana/Custom-3DRenderer",
  //   year: "2024",
  // },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
