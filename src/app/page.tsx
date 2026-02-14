import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">DevOps Blog</h1>
        <p className="text-gray-600">Engineering trends and insights</p>
      </header>

      <main>
        <section>
          <ul className="space-y-6">
            {allPostsData.map(({ id, date, title, coverImage, excerpt }) => (
              <li key={id} className="border-b border-gray-200 pb-6 last:border-0 hover:bg-gray-50 transition-colors p-4 rounded-lg">
                <Link href={`/posts/${id}`} className="block group">
                  {coverImage && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={`/Engineerblog${coverImage}`}
                        alt={title}
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                    {title}
                  </h2>
                  <small className="text-gray-500 font-medium block mb-2">
                    {date}
                  </small>
                  {excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DevOps Blog. All rights reserved.
      </footer>
    </div>
  );
}
