'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Typewriter from '@/components/custom/Typewriter';

export default function HeroSection() {
    return (
        <section className="py-16 md:py-24 min-h-[600px]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="min-h-[400px] flex flex-col justify-center">
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl md:text-4xl font-semibold leading-snug tracking-tight text-foreground mb-2 min-h-[2.5rem]">
                                    Hello<span className="pl-2 inline-block">👋</span>
                                </h1>

                                <h1 className="text-2xl md:text-4xl font-semibold leading-snug tracking-tight mb-4 min-h-[2.5rem]">
                                    I'm{' '}
                                    <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
                                        Kurniadi Ahmad Wijaya
                                    </span>
                                </h1>

                                <div className="min-h-[3rem]">
                                    <Typewriter
                                        text="Software Engineer with 3+ years crafting scalable fintech, SaaS, and AI platforms. Skilled in microservices and APIs built for peak performance."
                                        className="text-base md:text-lg text-foreground/80 max-w-2xl"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2 min-h-[3rem]">
                                <Link
                                    href="/journey"
                                    className="bg-gradient-to-r from-primary via-primary/90 to-accent/90 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                    See My Journey
                                    <ArrowRight size={16} className="ml-2" />
                                </Link>
                                <Link
                                    href="/about"
                                    className="bg-background border-2 border-primary text-primary hover:bg-primary/20 font-medium py-2 px-6 rounded-md transition-all duration-300 flex items-center gap-2"
                                >
                                    About Me
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[400px] flex items-center">
                        <div className="bg-muted/80 rounded-lg border border-border p-6 w-full">
                            <div className="flex items-center gap-2 mb-4 text-sm font-mono">
                                <span className="flex h-3 w-3 rounded-full bg-primary"></span>
                                <span className="text-primary font-semibold">// get-in-touch</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="text-xl">📍</div>
                                    <div>
                                        <div className="font-semibold text-foreground">Location</div>
                                        <div className="text-sm text-foreground/90">Jakarta, Indonesia</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="text-xl">✉️</div>
                                    <div>
                                        <div className="font-semibold text-foreground">Email</div>
                                        <a
                                            href="mailto:kurniadiahmadwijaya@gmail.com"
                                            className="text-sm text-primary hover:text-primary/90 hover:underline font-semibold"
                                        >
                                            kurniadiahmadwijaya@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="text-xl">🐙</div>
                                    <div>
                                        <div className="font-semibold text-foreground">GitHub</div>
                                        <a
                                            href="https://github.com/shinyq"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:text-primary/90 hover:underline font-semibold"
                                            aria-label="Visit my GitHub profile to explore my open source projects"
                                        >
                                            github.com/shinyq
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="text-xl">🔗</div>
                                    <div>
                                        <div className="font-semibold text-foreground">LinkedIn</div>
                                        <a
                                            href="https://www.linkedin.com/in/kurniadiwijaya/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:text-primary/90 hover:underline font-semibold"
                                            aria-label="Connect with me on LinkedIn to view my professional experience"
                                        >
                                            linkedin.com/in/kurniadiwijaya
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
