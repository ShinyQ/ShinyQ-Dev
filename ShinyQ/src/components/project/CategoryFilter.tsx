'use client';

import { useEffect, useState } from 'react';
import { tagCategories } from '@/data/tagCategories';

export default function CategoryFilter() {
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        // Listen for category changes from ProjectGrid
        const handleCategoryChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.category) {
                setActiveCategory(customEvent.detail.category);
            }
        };

        window.addEventListener('categoryChanged', handleCategoryChange);
        return () => window.removeEventListener('categoryChanged', handleCategoryChange);
    }, []);

    const handleClick = (category: string) => {
        setActiveCategory(category);
        // Dispatch event for ProjectGrid to listen
        document.dispatchEvent(new CustomEvent('categoryClick', { detail: { category } }));
    };

    return (
        <div className="flex flex-wrap gap-2 mb-3" id="category-filter">
            <button
                data-category="all"
                onClick={() => handleClick('all')}
                className={`category-button px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                        : 'bg-muted text-foreground/70 hover:bg-muted/80 hover:text-foreground'
                    }`}
            >
                All
            </button>
            {tagCategories.map((category) => (
                <button
                    key={category.id}
                    data-category={category.id}
                    onClick={() => handleClick(category.id)}
                    className={`category-button px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === category.id
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                            : 'bg-muted text-foreground/70 hover:bg-muted/80 hover:text-foreground'
                        }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
