import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://kurniadi.dev';

// Static pages with their relative priorities
const staticRoutes: MetadataRoute.Sitemap = [
    {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1.0,
    },
    {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
        url: `${BASE_URL}/projects`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    {
        url: `${BASE_URL}/journey`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    },
    {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getAllPosts();

    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
}
