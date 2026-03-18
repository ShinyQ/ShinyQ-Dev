import type { Project } from '@/data/projects';
import { getSignedFileUrl, listDirectoryFiles } from '@/lib/r2';
import type { R2File } from '@/lib/r2';

export interface GalleryImage {
    src: string;
    alt: string;
}

export interface EnhancedProject extends Omit<Project, 'gallery'> {
    gallery: GalleryImage[];
}

/**
 * Resolves gallery images for a single project from R2 storage.
 * Handles both directory-based galleries and fallback to cover image.
 */
async function resolveGallery(project: Project, signedCoverImage: string): Promise<GalleryImage[]> {
    if (!project.gallery || typeof project.gallery !== 'string') {
        return [{ src: signedCoverImage, alt: project.title }];
    }

    const directoryPath = project.gallery.endsWith('/')
        ? project.gallery
        : `${project.gallery}/`;

    const files: R2File[] = await listDirectoryFiles(directoryPath);

    const validFiles = files.filter((file) => {
        const relativePath = file.key.substring(directoryPath.length);
        return !relativePath.includes('/');
    });

    if (validFiles.length === 0) {
        return [{ src: signedCoverImage, alt: project.title }];
    }

    return Promise.all(
        validFiles.map(async (file, idx): Promise<GalleryImage> => ({
            src: await getSignedFileUrl(file.key),
            alt: `${project.title} ${idx + 1}`,
        }))
    );
}

/**
 * Enhances projects with signed R2 URLs for cover images and galleries.
 * Uses Promise.all for concurrent resolution.
 */
export async function enhanceProjects(projectList: Project[]): Promise<EnhancedProject[]> {
    return Promise.all(
        projectList.map(async (project): Promise<EnhancedProject> => {
            const signedCoverImage = await getSignedFileUrl(project.coverImage);
            const gallery = await resolveGallery(project, signedCoverImage);

            return {
                ...project,
                coverImage: signedCoverImage,
                gallery,
            };
        })
    );
}
