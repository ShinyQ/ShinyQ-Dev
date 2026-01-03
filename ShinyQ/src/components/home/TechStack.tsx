import Image from 'next/image';
import { techItems } from '@/data/techStack';

export default function TechStack() {
    const backend = techItems.filter((item) => item.type === 'backend');
    const frontend = techItems.filter((item) => item.type === 'frontend');
    const other = techItems.filter((item) => item.type === 'other');

    const TechRow = ({ items, animationClass }: { items: typeof backend; animationClass: string }) => (
        <div className="tech-slider relative overflow-hidden border border-border rounded-lg bg-gradient-to-r py-0">
            <div className="w-full relative overflow-hidden">
                <div className={`${animationClass} flex gap-3 w-max px-2`}>
                    {[...items, ...items].map((tech, index) => {
                        const content = (
                            <>
                                <div className="w-6 h-6 bg-white rounded-sm p-0.5">
                                    <Image
                                        src={tech.icon}
                                        alt={`${tech.name} technology icon`}
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <span className="whitespace-nowrap">{tech.name}</span>
                            </>
                        );

                        return tech.site ? (
                            <a
                                key={index}
                                href={tech.site}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-background shadow-sm rounded-md px-4 py-2 text-sm hover:scale-[1.02] transition-transform duration-300 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label={`Learn more about ${tech.name}`}
                            >
                                {content}
                            </a>
                        ) : (
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-background shadow-sm rounded-md px-4 py-2 text-sm hover:scale-[1.02] transition-transform duration-300"
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <section className="py-12 bg-muted text-center min-h-[400px]">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight min-h-[2.5rem]">
                    My Development Stack
                </h2>
                <p className="text-foreground/70 max-w-xl mx-auto text-sm mb-6">
                    Full-stack development with scalable backends, AI integration, and modern frontend architectures
                </p>
                <div className="space-y-4">
                    <TechRow items={backend} animationClass="marquee" />
                    <TechRow items={frontend} animationClass="marquee-slow" />
                    <TechRow items={other} animationClass="marquee-fast" />
                </div>
            </div>
        </section>
    );
}
