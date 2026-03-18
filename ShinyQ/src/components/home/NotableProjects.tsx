import { projects } from '@/data/projects';
import { enhanceProjects } from '@/lib/projects';
import NotableProjectsClient from './NotableProjectsClient';

export default async function NotableProjects() {
    const notableProjects = projects.slice(0, 3);
    const projectsWithData = await enhanceProjects(notableProjects);

    return (
        <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto">
                <div className="mb-12 text-center">
                    <div className="text-sm text-primary font-mono mb-2">// featured work</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Notable Projects</h2>
                    <p className="text-foreground/70 max-w-2xl mx-auto">
                        A selection of my most impactful projects, showcasing expertise in full-stack development,
                        system architecture, and product design.
                    </p>
                </div>

                <NotableProjectsClient projects={projectsWithData} />
            </div>
        </section>
    );
}
