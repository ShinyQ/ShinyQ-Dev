import { getPublicRepositories } from '@/lib/api/github';

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export default async function GithubSection() {
    let repos: any[] = [];
    let error: string | null = null;

    try {
        repos = (await getPublicRepositories()) as any[];
    } catch (e: unknown) {
        if (e && typeof e === 'object' && 'message' in e) {
            error = (e as any).message || 'Failed to load repositories.';
        } else {
            error = 'Failed to load repositories.';
        }
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="mb-6 flex justify-between items-end">
                    <h2 className="text-xl md:text-2xl font-bold">My Top GitHub Repos</h2>
                    <a
                        href="https://github.com/ShinyQ?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                        aria-label="View all my GitHub repositories"
                    >
                        View All Repositories
                    </a>
                </div>
                {error && <div className="text-center text-red-500 py-6">{error}</div>}
                {!error && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {repos && repos.length > 0 ? (
                            repos.map((repo: any, index: number) => (
                                <li
                                    key={repo.id || `repo-${index}`}
                                    className="flex items-start gap-3 bg-muted/60 border border-border rounded-md px-4 py-3 hover:shadow-md transition-shadow duration-200 min-h-[120px]"
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
            </div>
        </section>
    );
}
