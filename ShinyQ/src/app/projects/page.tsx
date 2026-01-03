import { projects } from '@/data/projects';
import type { Project as ProjectType } from '@/data/projects';
import ProjectGrid from '@/components/project/ProjectGrid';
import CategoryFilter from '@/components/project/CategoryFilter';
import { getSignedFileUrl, listDirectoryFiles } from '@/lib/r2';
import type { R2File } from '@/lib/r2';

interface GalleryImage {
    src: string;
    alt: string;
}

interface EnhancedProject extends Omit<ProjectType, 'gallery'> {
    gallery: GalleryImage[];
}

export default async function ProjectsPage() {
    const enhancedProjects = await Promise.all(
        projects.map(async (project): Promise<EnhancedProject> => {
            const signedCoverImage = await getSignedFileUrl(project.coverImage);
            const galleryImages: GalleryImage[] = [];

            if (project.gallery) {
                if (typeof project.gallery === 'string') {
                    const directoryPath = project.gallery.endsWith('/')
                        ? project.gallery
                        : `${project.gallery}/`;

                    const files: R2File[] = await listDirectoryFiles(directoryPath);

                    const validFiles = files.filter((file) => {
                        const relativePath = file.key.substring(directoryPath.length);
                        return !relativePath.includes('/');
                    });

                    const imagePromises = validFiles.map(
                        async (file, idx): Promise<GalleryImage> => ({
                            src: await getSignedFileUrl(file.key),
                            alt: `${project.title} ${idx + 1}`,
                        })
                    );

                    const images = await Promise.all(imagePromises);
                    galleryImages.push(...images);
                }
            }

            if (galleryImages.length === 0) {
                galleryImages.push({
                    src: signedCoverImage,
                    alt: project.title,
                });
            }

            return {
                ...project,
                coverImage: signedCoverImage,
                gallery: galleryImages,
            };
        })
    );

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
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
