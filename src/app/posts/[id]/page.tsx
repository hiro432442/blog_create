import { getAllPostIds, getPostData } from '@/lib/posts';
import Link from 'next/link';

export async function generateStaticParams() {
    const paths = getAllPostIds();
    return paths.map((path) => ({
        id: path.params.id,
    }));
}

export default async function Post({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const postData = await getPostData(id);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium">&larr; Back to Home</Link>
            <article className="prose prose-slate mx-auto">
                <h1 className="text-3xl font-bold mb-4">{postData.title}</h1>
                <div className="text-gray-500 mb-8">{postData.date}</div>
                <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
            <div className="mt-12 border-t pt-8">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                    &larr; Back to Home
                </Link>
            </div>
        </div>
    );
}
