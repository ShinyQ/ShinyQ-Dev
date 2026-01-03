'use client';

import React, { useState, useEffect } from "react";
import ProjectDetailsModal from "@/components/project/ProjectDetailsModal";
import { getSubcategories } from "@/data/tagCategories";
import { ChevronRight } from "lucide-react";

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
  gallery: GalleryImage[];
}

interface ProjectGridProps {
  projects: Project[];
}

const ITEMS_PER_PAGE = 9;

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleCategoryClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.category) {
        setActiveCategory(customEvent.detail.category);
        setCurrentPage(1);
      }
    };

    document.addEventListener('categoryClick', handleCategoryClick);
    return () => document.removeEventListener('categoryClick', handleCategoryClick);
  }, []);

  useEffect(() => {
    const filtered = projects.filter((project) => {
      if (activeCategory === "all") return true;
      const subcategories = getSubcategories(activeCategory);
      return project.tags.some((tag) => subcategories.includes(tag));
    });

    setFilteredProjects(filtered);
  }, [projects, activeCategory]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleViewMore = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        id="projects-grid"
      >
        {currentProjects.map((project) => (
          <div
            className="project-card flex flex-col h-full bg-card rounded-lg border border-border shadow-lg hover:shadow-xl hover:border-primary transition-all duration-300"
            data-tags={project.tags.join(",")}
            key={project.id}
          >
            <div className="h-48 overflow-hidden rounded-t-lg flex-shrink-0">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="p-6 flex flex-col h-full">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/80" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="mt-auto">
                <button
                  className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm font-medium"
                  onClick={() => handleViewMore(project)}
                >
                  View More <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div id="no-projects" className="text-center py-10 text-foreground/70">
            No projects found for this category.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed bg-muted text-foreground/70 hover:bg-accent"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg border transition ${currentPage === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground/70 hover:bg-accent"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed bg-muted text-foreground/70 hover:bg-accent"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProjectDetailsModal
        project={selectedProject}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ProjectGrid;
