import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants } from '@/scripts/timeline-animations';
import TimelineItem from '@/components/journey/TimelineItem';
import type { TimelineProps } from '@/data/timeline';

export default function Timeline({ items, filters }: Readonly<TimelineProps>) {
    const [activeFilter, setActiveFilter] = useState<string | null>("Full-Time");

    const filteredItems = useMemo(() => {
        const filtered = activeFilter ? items.filter(item => item.type === activeFilter) : items;
        return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [items, activeFilter]);

    return (
        <>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
            >
                <div className="text-sm text-primary font-mono mb-2">{"// life activities timeline"}</div>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Journey</h1>
                <p className="text-lg text-foreground/80 max-w-3xl">
                    My professional journey, education, and key milestones over the years.
                </p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10 flex flex-wrap gap-2"
            >
                {filters.map(({ label, value }) => (
                    <Button
                        key={label}
                        variant={activeFilter === value ? "default" : "outline"}
                        onClick={() => setActiveFilter(value)}
                        className="transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/90 hover:to-accent transform hover:scale-105"
                    >
                        {label}
                    </Button>
                ))}
            </motion.div>

            {/* Timeline Items */}
            <div className="relative border-l border-border">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                    >
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => <TimelineItem key={item.slug} item={item} />)
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-20"
                            >
                                <h3 className="text-xl mb-2">No timeline items found</h3>
                                <p className="text-foreground/70">No items match the selected filter. Try selecting a different category.</p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
} 