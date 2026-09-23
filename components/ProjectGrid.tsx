import ProjectCard from "@/components/ProjectCard";
import SectionHeading from "@/components/SectionHeading";
import { getAllProjects } from "@/lib/content";

export default function ProjectGrid() {
  const projects = getAllProjects();

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        index="03"
        command="ls -lt ./projects"
        title="Projects"
        description="Real things, built from an empty folder. Each one has a write-up covering the stack, the decisions and the code that mattered."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
