import fs from "fs";
import path from "path";
import Image from "next/image";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { projects, getProjectBySlug } from "@/data/projects";
import Navbar from "@/components/Navbar";
import EncryptedText from "@/components/EncryptedText";
import TableOfContents from "@/components/TableOfContents";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} — Ben Santana`,
    description: project.description,
  };
}

export default async function ProjectArticle({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "projects",
    `${slug}.mdx`
  );

  let mdxContent: React.ReactNode;
  try {
    const source = fs.readFileSync(filePath, "utf8");
    const { content } = await compileMDX({ source });
    mdxContent = content;
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />

      {/* Banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          priority
          className="object-cover blur-[10px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-3xl mx-auto">
            <EncryptedText text={project.title} as="h1" className="text-4xl md:text-6xl font-bebas text-white mb-4" speed={30} />
            <div className="flex flex-wrap items-center gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 flex gap-12">
        <article className="max-w-3xl mx-auto min-w-0 flex-1">
          {project.videoUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-10">
              <iframe
                src={project.videoUrl}
                title={`${project.title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-neutral-900 dark:prose-strong:text-white">
            {mdxContent}
          </div>
        </article>

        <aside className="hidden xl:block w-56 shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </main>
  );
}
