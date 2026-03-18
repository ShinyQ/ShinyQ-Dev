import type { Project } from '@/data/projects';
import { getSignedFileUrl, listDirectoryFiles } from '@/lib/r2';
import type { R2File } from '@/lib/r2';

export interface GalleryImage {
    src: string;
    alt: string;
}

export interface EnhancedProject extends Omit<Project, 'gallery'> {
    gallery: GalleryImage[];
    galleryDir?: string;
}

/**
 * Resolves gallery images for a single project from R2 storage.
 * Only fetches cover image + first 2 gallery previews for the card view.
 */
async function resolveGalleryPreview(project: Project, signedCoverImage: string): Promise<{ gallery: GalleryImage[]; galleryDir?: string }> {
    if (!project.gallery || typeof project.gallery !== 'string') {
        return { gallery: [{ src: signedCoverImage, alt: project.title }] };
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
        return { gallery: [{ src: signedCoverImage, alt: project.title }] };
    }

    // Only sign first 2 images for preview, rest loaded lazily
    const previewFiles = validFiles.slice(0, 2);
    const previewGallery = await Promise.all(
        previewFiles.map(async (file, idx): Promise<GalleryImage> => ({
            src: await getSignedFileUrl(file.key),
            alt: `${project.title} ${idx + 1}`,
        }))
    );

    return {
        gallery: previewGallery,
        galleryDir: directoryPath,
    };
}

/**
 * Resolves all gallery images for a project (called lazily from API route).
 */
export async function resolveFullGallery(galleryDir: string, projectTitle: string): Promise<GalleryImage[]> {
    const files: R2File[] = await listDirectoryFiles(galleryDir);

    const validFiles = files.filter((file) => {
        const relativePath = file.key.substring(galleryDir.length);
        return !relativePath.includes('/');
    });

    if (validFiles.length === 0) {
        return [];
    }

    return Promise.all(
        validFiles.map(async (file, idx): Promise<GalleryImage> => ({
            src: await getSignedFileUrl(file.key),
            alt: `${projectTitle} ${idx + 1}`,
        }))
    );
}

/**
 * Enhances projects with signed R2 URLs for cover images and gallery previews.
 * Full gallery is loaded lazily when user opens the modal.
 */
export async function enhanceProjects(projectList: Project[]): Promise<EnhancedProject[]> {
    return Promise.all(
        projectList.map(async (project): Promise<EnhancedProject> => {
            const signedCoverImage = await getSignedFileUrl(project.coverImage);
            const { gallery, galleryDir } = await resolveGalleryPreview(project, signedCoverImage);

            return {
                ...project,
                coverImage: signedCoverImage,
                gallery,
                galleryDir,
            };
        })
    );
}
