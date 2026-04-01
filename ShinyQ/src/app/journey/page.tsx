import { timelineItems } from '@/data/timeline';
import { enhanceTimeline } from '@/lib/timeline';
import Timeline from '@/components/journey/Timeline';

const FILTERS = [
    { label: "Full-Time", value: "Full-Time" },
    { label: "Part-Time", value: "Part-Time" },
    { label: "Education", value: "Education" },
    { label: "Certifications", value: "Certification" },
    { label: "Competitions", value: "Competition" }
];

export default async function JourneyPage() {
    const enhanced = await enhanceTimeline(timelineItems);

    return (
        <div className="container mx-auto py-16 md:py-20">
            <Timeline
                items={enhanced}
                filters={FILTERS}
            />
        </div>
    );
}
