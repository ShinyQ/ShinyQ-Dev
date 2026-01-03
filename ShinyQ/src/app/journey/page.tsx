'use client';

import { timelineItems } from '@/data/timeline';
import Timeline from '@/components/journey/Timeline';

const FILTERS = [
    { label: "Full-Time", value: "Full-Time" },
    { label: "Part-Time", value: "Part-Time" },
    { label: "Education", value: "Education" },
    { label: "Certifications", value: "Certification" },
    { label: "Competitions", value: "Competition" }
];

export default function JourneyPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <Timeline
                items={timelineItems}
                filters={FILTERS}
            />
        </div>
    );
}
