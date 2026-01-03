import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    coverImage: string;
    excerpt: string;
    tags: string[];
    readingTime?: string;
    category?: string;
    featured?: boolean;
    content: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map((fileName) => {
            const slug = fileName.replace(/\.mdx$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            return {
                slug,
                title: data.title || '',
                date: data.date || '',
                coverImage: data.coverImage || '',
                excerpt: data.excerpt || '',
                tags: data.tags || [],
                readingTime: data.readingTime,
                category: data.category,
                featured: data.featured || false,
                content,
            } as BlogPost;
        });

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title || '',
            date: data.date || '',
            coverImage: data.coverImage || '',
            excerpt: data.excerpt || '',
            tags: data.tags || [],
            readingTime: data.readingTime,
            category: data.category,
            featured: data.featured || false,
            content,
        };
    } catch {
        return null;
    }
}

export function getAllTags(posts: BlogPost[]): string[] {
    const tags = new Set<string>();
    posts.forEach((post) => {
        post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
}
