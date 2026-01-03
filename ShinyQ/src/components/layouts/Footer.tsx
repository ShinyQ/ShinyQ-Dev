import Link from 'next/link';
import { getUniqueVisitorCount } from '@/lib/uniqueVisitor';

export default async function Footer() {
    const visitorCount = await getUniqueVisitorCount();

    return (
        <footer className="bg-card border-t border-border mt-10">
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <Link
                            href="/"
                            className="text-xl font-bold text-primary"
                            aria-label="Go to homepage"
                        >
                            <span className="text-primary">&gt;</span> ShinyQ
                            <span className="text-primary">_</span>
                        </Link>
                        <div className="mt-4 flex items-center space-x-2">
                            <div className="flex items-center space-x-1.5 text-primary/80">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                <span className="text-sm font-mono tracking-wide">
                                    {visitorCount.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-xs text-foreground/50">Visitors Count</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Navigations</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                                    aria-label="Go to homepage"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                                    aria-label="Learn more about me"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/journey"
                                    className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                                    aria-label="View my professional journey"
                                >
                                    Journey
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                                    aria-label="Read my blog posts"
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/projects"
                                    className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                                    aria-label="View my projects"
                                >
                                    Projects
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Contact</h3>
                        <ul className="space-y-2">
                            <li className="text-foreground">📍 Jakarta, Indonesia</li>
                            <li>
                                <a
                                    href="mailto:kurniadiahmadwijaya@gmail.com"
                                    className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                                    aria-label="Send me an email"
                                >
                                    ✉️ kurniadiahmadwijaya@gmail.com
                                </a>
                            </li>
                        </ul>
                        <div className="mt-4 flex space-x-3">
                            <a
                                href="https://github.com/ShinyQ"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm p-1 flex items-center gap-2"
                                aria-label="Visit my GitHub profile to see my open source contributions"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="feather feather-github"
                                >
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/in/kurniadiwijaya"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm p-1"
                                aria-label="Visit my LinkedIn profile"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-6 text-center text-foreground/50 text-sm">
                    © {new Date().getFullYear()} Kurniadi Ahmad Wijaya. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
