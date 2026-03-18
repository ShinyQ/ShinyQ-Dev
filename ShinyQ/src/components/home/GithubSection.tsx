import { getPublicRepositories } from '@/lib/api/github';

type RepoInfo = {
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    updated_at: string;
};

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export default async function GithubSection() {
    let repos: RepoInfo[] = [];
    let error: string | null = null;

    try {
        repos = await getPublicRepositories();
    } catch (e: unknown) {
        error = e instanceof Error ? e.message : 'Failed to load repositories.';
    }

    return (
        <section className="py-16 md:py-20">
            <div className="container mx-auto">
                <div className="mb-10 text-center">
                    <div className="text-sm text-primary font-mono mb-2">// open source</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">My Top GitHub Repos</h2>
                    <p className="text-foreground/70 max-w-2xl mx-auto">
                        Explore my most popular open-source repositories, reflecting my passion for building
                        scalable and well-crafted software.
                    </p>
                </div>
                {error && <div className="text-center text-red-500 py-6">{error}</div>}
                {!error && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {repos.length > 0 ? (
                            repos.map((repo) => (
                                <li
                                    key={repo.name}
                                    className="flex items-start gap-3 bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 min-h-[120px]"
                                >
                                    <div className="pt-1">
                                        <svg
                                            width="22"
                                            height="22"
                                            fill="currentColor"
                                            className="text-primary"
                                        >
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col h-full">
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-primary hover:underline text-base truncate block"
                                        >
                                            {repo.name}
                                        </a>
                                        <div className="flex flex-wrap gap-2 text-xs text-foreground/60 items-center mt-1 mb-1">
                                            {repo.language && (
                                                <span className="px-2 py-0.5 rounded bg-background border text-foreground/80">
                                                    {repo.language}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground/70 mt-1 mb-3">
                                            {repo.description || (
                                                <span className="italic text-foreground/40">
                                                    No description
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex w-full justify-between items-end mt-auto text-xs text-foreground/60 gap-3">
                                            <div className="flex gap-3">
                                                <span title="Stars">★ {repo.stargazers_count}</span>
                                                <span title="Forks">🍴 {repo.forks_count}</span>
                                            </div>
                                            <span className="text-foreground/40" title="Last updated">
                                                {formatDate(repo.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="text-center text-foreground/70 py-6 col-span-full">
                                No repositories found.
                            </li>
                        )}
                    </ul>
                )}

                <div className="mt-10 text-center">
                    <a
                        href="https://github.com/ShinyQ?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-transparent border border-border text-foreground hover:text-primary hover:border-primary transition-colors py-2 px-6 rounded-md text-sm font-medium"
                        aria-label="View all my GitHub repositories"
                    >
                        View All Repositories
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
