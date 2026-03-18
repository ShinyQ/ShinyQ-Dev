import { projects } from '@/data/projects';
import { enhanceProjects } from '@/lib/projects';
import ProjectGrid from '@/components/project/ProjectGrid';
import CategoryFilter from '@/components/project/CategoryFilter';

export default async function ProjectsPage() {
    const enhancedProjects = await enhanceProjects(projects);

    return (
        <div className="container mx-auto py-16 md:py-20">
            <div className="mb-12">
                <div className="text-sm text-primary font-mono mb-2">
                    {"// featured projects"}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">My Projects</h1>
                <p className="text-lg text-foreground/80 max-w-3xl">
                    A collection of projects I've built and contributed to. These range from
                    personal explorations to professional work across various domains.
                </p>
            </div>

            <div className="mb-12">
                <CategoryFilter />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                    <span>Click category to filter projects • Click 'View More' for full descriptions, galleries, tech stacks, and more!</span>
                </div>
            </div>

            <ProjectGrid projects={enhancedProjects} />

            <div className="text-center py-20 hidden" id="no-projects">
                <h3 className="text-xl mb-2">No projects found</h3>
                <p className="text-foreground/70">
                    No projects match the selected filter. Try selecting a different category.
                </p>
            </div>
        </div>
    );
}
