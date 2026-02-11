import { MetadataRoute } from 'next';
import { getSortedPostsData } from '../lib/posts';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = getSortedPostsData();
    const baseUrl = 'https://flacta.com/Engineerblog';

    const postUrls = posts.map((post) => ({
        url: `${baseUrl}/posts/${post.id}/`, // Add trailing slash for trailingSlash: true compatibility
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
