'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, ExternalLink, Info, File, FileSliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GalleryModal from './GalleryModal';

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
    gallery: { src: string; alt?: string; }[];
}

interface ProjectDetailsModalProps {
    project: Project | null;
    open: boolean;
    onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, open, onClose }) => {
    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [galleryIndex, setGalleryIndex] = React.useState(0);

    if (!project) {
        return null;
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l border-border shadow-xl z-50"
                        style={{ top: '64px' }}
                    >
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 border-b border-border flex justify-between items-center"
                            >
                                <h2 className="text-2xl font-bold">{project.title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={24} />
                                </button>
                            </motion.div>

                            {/* Scrollable Content */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 overflow-y-auto p-6"
                            >
                                {/* Gallery Preview */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-6"
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        {project.gallery.slice(0, 2).map((image, index) => (
                                            <motion.button
                                                key={`gallery-preview-${index}`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4 + index * 0.1 }}
                                                onClick={() => {
                                                    setGalleryIndex(index);
                                                    setGalleryOpen(true);
                                                }}
                                                className="aspect-video overflow-hidden rounded-lg"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <img
                                                    src={image.src}
                                                    alt={image.alt ?? `Project screenshot ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    {project.gallery.length > 2 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                            className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
                                        >
                                            <Info size={16} />
                                            <span>Click image to view more.</span>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Description */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-6"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-foreground/80 whitespace-pre-line">{project.description}</p>
                                </motion.div>

                                {/* Role */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mb-6"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Role</h3>
                                    <p className="text-foreground/80">{project.role}</p>
                                </motion.div>

                                {/* Tags */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="mb-6"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag, index) => (
                                            <motion.span
                                                key={`tag-${tag}-${index}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.7 + index * 0.05 }}
                                                className="px-3 py-1 bg-muted rounded-full text-sm"
                                            >
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Tech Stack */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="mb-6"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map((tech, index) => (
                                            <motion.span
                                                key={`tech-${tech}-${index}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.8 + index * 0.05 }}
                                                className="px-3 py-1 bg-muted/50 rounded-md text-sm"
                                            >
                                                {tech}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Links */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-3 flex flex-wrap gap-3"
                                >
                                    {project.liveUrl && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button className="flex items-center gap-2">
                                                    <ExternalLink size={16} />
                                                    Live Demo
                                                </Button>
                                            </a>
                                        </motion.div>
                                    )}
                                    {project.githubUrl && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <GitBranch size={16} />
                                                    GitHub
                                                </Button>
                                            </a>
                                        </motion.div>
                                    )}
                                    {project.docUrl && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <a
                                                href={project.docUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <File size={16} />

                                                    Docs
                                                </Button>
                                            </a>
                                        </motion.div>
                                    )}
                                    {project.docPpt && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <a
                                                href={project.docPpt}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <FileSliders size={16} />
                                                    Slides
                                                </Button>
                                            </a>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}

            <GalleryModal
                images={project.gallery}
                open={galleryOpen}
                startIndex={galleryIndex}
                onClose={() => setGalleryOpen(false)}
            />
        </AnimatePresence>
    );
};

export default ProjectDetailsModal; 