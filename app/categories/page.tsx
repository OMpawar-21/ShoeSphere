import { getAllCategories } from '@/lib/contentstack';
import { ContentstackCategory } from '@/types/contentstack';
import Link from 'next/link';

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-black mb-2">
              All Categories
            </h1>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category: ContentstackCategory, index: number) => {
              const slug = slugify(category.title);

              return (
                <Link
                  key={category.uid}
                  href={`/category/${slug}`}
                  className="group border-2 border-gray-200 p-6 sm:p-7 hover:border-black transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black group-hover:underline">
                    {category.title}
                  </h3>
                  {Array.isArray(category.shoe_type) && category.shoe_type.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {category.shoe_type.slice(0, 3).join(', ')}
                      {category.shoe_type.length > 3 ? '…' : ''}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
