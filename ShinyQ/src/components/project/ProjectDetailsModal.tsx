'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { X, GitBranch, ExternalLink, Info, File, FileSliders, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GalleryModal from './GalleryModal';

interface GalleryImage {
    src: string;
    alt?: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    tags: string[];
    role: string;
    techStack: string[];
    githubUrl?: string;
    liveUrl?: string;
    docUrl?: string;
    docPpt?: string;
    gallery: GalleryImage[];
    galleryDir?: string;
}

interface ProjectDetailsModalProps {
    project: Project | null;
    open: boolean;
    onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, open, onClose }) => {
    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [galleryIndex, setGalleryIndex] = React.useState(0);
    const [isVisible, setIsVisible] = React.useState(false);
    const [fullGallery, setFullGallery] = React.useState<GalleryImage[] | null>(null);
    const [loadingGallery, setLoadingGallery] = React.useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const galleryCacheRef = useRef<Map<string, GalleryImage[]>>(new Map());

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setIsVisible(true));
            setFullGallery(null);
        } else {
            setIsVisible(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    const fetchFullGallery = useCallback(async () => {
        if (!project?.galleryDir) return;

        // Check client-side cache first
        const cached = galleryCacheRef.current.get(project.id);
        if (cached) {
            setFullGallery(cached);
            return;
        }

        setLoadingGallery(true);
        try {
            const params = new URLSearchParams({
                dir: project.galleryDir,
                title: project.title,
            });
            const res = await fetch(`/api/gallery?${params}`);
            if (res.ok) {
                const data = await res.json();
                galleryCacheRef.current.set(project.id, data.images);
                setFullGallery(data.images);
            }
        } catch (err) {
            console.error('[Gallery] Failed to load:', err);
        } finally {
            setLoadingGallery(false);
        }
    }, [project?.galleryDir, project?.id, project?.title]);

    const handleOpenGallery = useCallback(async (index: number) => {
        setGalleryIndex(index);

        // If we have a galleryDir and haven't loaded full gallery, fetch it
        if (project?.galleryDir && !fullGallery) {
            await fetchFullGallery();
        }

        setGalleryOpen(true);
    }, [project?.galleryDir, fullGallery, fetchFullGallery]);

    if (!project || !open) return null;

    // Use full gallery if loaded, otherwise use preview images
    const galleryImages = fullGallery || project.gallery;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-border shadow-xl z-50 transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ top: '64px' }}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{project.title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className={`flex-1 overflow-y-auto p-6 transition-opacity duration-300 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Gallery Preview */}
                        <div className="mb-6">
                            <div className="grid grid-cols-2 gap-2">
                                {project.gallery.slice(0, 2).map((image, index) => (
                                    <button
                                        key={`gallery-preview-${index}`}
                                        onClick={() => handleOpenGallery(index)}
                                        className="aspect-video overflow-hidden rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 relative"
                                    >
                                        <img
                                            src={image.src}
                                            alt={image.alt ?? `Project screenshot ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {loadingGallery && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {project.galleryDir && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Info size={16} />
                                    <span>Click image to view full gallery.</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-foreground/80 whitespace-pre-line">{project.description}</p>
                        </div>

                        {/* Role */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Role</h3>
                            <p className="text-foreground/80">{project.role}</p>
                        </div>

                        {/* Tags */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, index) => (
                                    <span
                                        key={`tag-${tag}-${index}`}
                                        className="px-3 py-1 bg-muted rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech, index) => (
                                    <span
                                        key={`tech-${tech}-${index}`}
                                        className="px-3 py-1 bg-muted/50 rounded-md text-sm"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div className="mt-3 flex flex-wrap gap-3">
                            {project.liveUrl && (
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                    <Button className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
                                        <ExternalLink size={16} />
                                        Live Demo
                                    </Button>
                                </a>
                            )}
                            {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
                                        <GitBranch size={16} />
                                        GitHub
                                    </Button>
                                </a>
                            )}
                            {project.docUrl && (
                                <a href={project.docUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
                                        <File size={16} />
                                        Docs
                                    </Button>
                                </a>
                            )}
                            {project.docPpt && (
                                <a href={project.docPpt} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform">
                                        <FileSliders size={16} />
                                        Slides
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <GalleryModal
                key={`project-gallery-${project.id}`}
                images={galleryImages}
                open={galleryOpen}
                startIndex={galleryIndex}
                onClose={() => setGalleryOpen(false)}
            />
        </>
    );
};

export default ProjectDetailsModal;
