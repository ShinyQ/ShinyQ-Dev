import { getAllPosts, getAllTags } from '@/lib/blog';
import { getSignedFileUrl } from '@/lib/r2';
import BlogList from '@/components/blog/BlogList';

export default async function BlogPage() {
    const posts = await getAllPosts();
    const allTags = getAllTags(posts);

    // Get signed URLs for cover images
    const postsWithSignedUrls = await Promise.all(
        posts.map(async (post) => ({
            ...post,
            coverImage: post.coverImage ? await getSignedFileUrl(post.coverImage) : '/placeholder.svg',
        }))
    );

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mb-10">
                <div className="text-sm text-primary font-mono mb-2">// thoughts and insights</div>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Blog</h1>
                <p className="text-lg text-foreground/80 max-w-3xl">
                    Articles, tutorials, and thoughts on software development, architecture, and engineering
                    practices.
                </p>
            </div>

            <BlogList posts={postsWithSignedUrls} allTags={allTags} />
        </div>
    );
}
