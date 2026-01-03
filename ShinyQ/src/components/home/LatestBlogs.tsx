import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import { getSignedFileUrl } from '@/lib/r2';

export default async function LatestBlogs() {
    const allPosts = await getAllPosts();
    const latestPosts = allPosts.slice(0, 3);

    // Get signed URLs for cover images
    const postsWithSignedUrls = await Promise.all(
        latestPosts.map(async (post) => ({
            ...post,
            coverImage: post.coverImage ? await getSignedFileUrl(post.coverImage) : '/placeholder.svg',
        }))
    );

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">From My Blog</h2>
                    </div>
                    <Link
                        href="/blog"
                        className="bg-transparent border border-border text-foreground hover:text-primary hover:border-primary transition-colors py-2 px-4 rounded-md flex items-center"
                    >
                        View All
                        <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {postsWithSignedUrls.length === 0 ? (
                    <div className="text-center text-foreground/70 py-12">
                        <p>Blog posts coming soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {postsWithSignedUrls.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="block h-full">
                                <div className="bg-card rounded-lg overflow-hidden border border-border h-full hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                                    <div className="h-48 overflow-hidden relative">
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/80"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                                        <p className="text-foreground/70 text-sm mb-3 line-clamp-3">{post.excerpt}</p>
                                        <div className="text-xs text-foreground/60 mt-auto">
                                            {new Date(post.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
