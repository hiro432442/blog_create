import { MetadataRoute } from 'next';
import { getSortedPostsData } from '../lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = getSortedPostsData();
    const baseUrl = 'https://hiro432442.github.io/blog_create'; // GitHub Pages URL

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/posts/${post.id}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...postUrls,
    ];
}
