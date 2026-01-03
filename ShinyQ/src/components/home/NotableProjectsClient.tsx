'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectDetailsModal from '@/components/project/ProjectDetailsModal';
import Link from 'next/link';

interface GalleryImage {
    src: string;
    alt: string;
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
}

interface NotableProjectsClientProps {
    projects: Project[];
}

export default function NotableProjectsClient({ projects }: NotableProjectsClientProps) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleViewDetails = (project: Project) => {
        setSelectedProject(project);
        setModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                    >
                        {/* Cover Image */}
                        <div className="relative h-64 overflow-hidden">
                            <Image
                                src={project.coverImage}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                            {/* Featured Badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold rounded-full">
                                Featured
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative p-6 -mt-20">
                            <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
                                {project.description}
                            </p>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.techStack.slice(0, 4).map((tech) => (
                                    <span
                                        key={tech}
                                        className="text-xs px-2 py-1 rounded-md bg-muted/80 text-foreground/80 border border-border/50"
                                    >
                                        {tech}
                                    </span>
                                ))}
                                {project.techStack.length > 4 && (
                                    <span className="text-xs px-2 py-1 rounded-md bg-muted/80 text-foreground/60">
                                        +{project.techStack.length - 4} more
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="default"
                                    className="flex-1 group/btn"
                                    onClick={() => handleViewDetails(project)}
                                >
                                    View Details
                                    <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>

                                {project.githubUrl && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        asChild
                                    >
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="View on GitHub"
                                        >
                                            <Github size={18} />
                                        </a>
                                    </Button>
                                )}

                                {project.liveUrl && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        asChild
                                    >
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="View Live Demo"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Projects Link */}
            <div className="text-center">
                <Link href="/projects">
                    <Button variant="outline" size="lg" className="group">
                        View All Projects
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Project Details Modal */}
            <ProjectDetailsModal
                project={selectedProject}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}
