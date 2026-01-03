import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { getSignedFileUrl } from '@/lib/r2';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MDXRemote } from 'next-mdx-remote/rsc';

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const coverImage = post.coverImage ? await getSignedFileUrl(post.coverImage) : '/placeholder.svg';

    // Get related posts
    const allPosts = await getAllPosts();
    const otherPosts = allPosts.filter((p) => p.slug !== slug);

    const relatedPosts = otherPosts
        .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
        .slice(0, 3);

    const finalRelatedPosts = relatedPosts.length ? relatedPosts : otherPosts.slice(0, 3);

    // Get signed URLs for related posts
    const relatedPostsWithImages = await Promise.all(
        finalRelatedPosts.map(async (p) => ({
            ...p,
            coverImage: p.coverImage ? await getSignedFileUrl(p.coverImage) : '/placeholder.svg',
        }))
    );

    return (
        <>
            <div className="w-full bg-muted mb-12">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags?.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
                        <div className="flex items-center gap-2">
                            {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                        {post.readingTime && (
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>{post.readingTime} read</span>
                            </div>
                        )}
                        {post.category && (
                            <div className="flex items-center gap-2">
                                <span>•</span>
                                <span>{post.category}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {coverImage && coverImage !== '/placeholder.svg' && (
                        <div className="mb-8">
                            <Image
                                src={coverImage}
                                alt={post.title}
                                width={1200}
                                height={630}
                                className="blog-cover-image"
                            />
                        </div>
                    )}

                    <article className="blog-content prose prose-invert max-w-none">
                        <MDXRemote source={post.content} />
                    </article>

                    <div className="mt-16 pt-8 border-t border-border/50">
                        <Button variant="outline" asChild>
                            <Link href="/blog" className="flex items-center group">
                                <ArrowLeft
                                    size={16}
                                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                                />
                                Back to Blog
                            </Link>
                        </Button>
                    </div>

                    {relatedPostsWithImages.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-border/50">
                            <h3 className="text-2xl font-bold mb-8 bg-gradient-to-br from-white to-foreground/70 bg-clip-text text-transparent">
                                Related Posts
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPostsWithImages.map((related) => (
                                    <Link
                                        key={related.slug}
                                        href={`/blog/${related.slug}`}
                                        className="group h-full"
                                    >
                                        <div className="bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                                            <div className="aspect-video overflow-hidden relative">
                                                <Image
                                                    src={related.coverImage}
                                                    alt={related.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-grow">
                                                    {related.title}
                                                </h4>
                                                <div className="text-xs text-foreground/60 flex items-center gap-2">
                                                    <span>
                                                        {new Date(related.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                    {related.readingTime && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{related.readingTime} read</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
