import { projects } from '@/data/projects';
import { getSignedFileUrl, listDirectoryFiles } from '@/lib/r2';
import type { R2File } from '@/lib/r2';
import NotableProjectsClient from './NotableProjectsClient';

interface GalleryImage {
    src: string;
    alt: string;
}

export default async function NotableProjects() {
    // Get first 3 projects as notable projects
    const notableProjects = projects.slice(0, 3);

    // Process projects with R2 signed URLs and galleries
    const projectsWithData = await Promise.all(
        notableProjects.map(async (project) => {
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
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
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
