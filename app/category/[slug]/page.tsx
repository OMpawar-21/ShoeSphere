import { getAllShoes, getCategoriesBySlug, getEntriesWithCount } from '@/lib/contentstack';
import { ContentstackShoe } from '@/types/contentstack';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const PAGE_SIZE = 4;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategoriesBySlug(slug);

  if (categories.length === 0) return notFound();

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedParams?.page || 1));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const categoryUids = categories.map((category) => category.uid);

  let { entries: shoes, count } = await getEntriesWithCount<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
    queryBuilder: (query) => query.containedIn('category_ref', categoryUids).skip(skip).limit(PAGE_SIZE),
  });

  if (count === 0) {
    const allShoes = await getAllShoes();
    const filtered = allShoes.filter((shoe) => {
      const refs = Array.isArray(shoe.category_ref)
        ? shoe.category_ref
        : shoe.category_ref
          ? [shoe.category_ref]
          : [];
      return refs.some((ref) => ref?.uid && categoryUids.includes(ref.uid));
    });

    count = filtered.length;
    shoes = filtered.slice(skip, skip + PAGE_SIZE);
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-black mb-2">
              {categories.length === 1 ? categories[0].title : slug.replace(/-/g, ' ')}
            </h1>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {shoes.map((shoe: ContentstackShoe, index: number) => {
              const brandTitle = Array.isArray(shoe.brand_ref)
                ? shoe.brand_ref[0]?.title
                : shoe.brand_ref?.title;

              return (
                <Link
                  href={shoe.url}
                  key={shoe.uid}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden bg-white aspect-square flex items-center justify-center p-4 sm:p-6 transition-all duration-500 group-hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {shoe.main_image?.url ? (
                      <img
                        src={shoe.main_image.url}
                        alt={shoe.title}
                        className="relative z-10 w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative z-10 w-full h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      {brandTitle || 'Brand'}
                    </p>
                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-black group-hover:underline transition-all duration-200 line-clamp-2">
                      {shoe.title}
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-black">
                      ${shoe.price}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-center gap-3">
            <Link
              href={`/category/${slug}?page=${currentPage - 1}`}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-all duration-200 ${
                canGoPrev
                  ? 'border-black text-black hover:bg-black hover:text-white'
                  : 'border-gray-300 text-gray-300 pointer-events-none'
              }`}
              aria-disabled={!canGoPrev}
            >
              Prev
            </Link>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/category/${slug}?page=${currentPage + 1}`}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-all duration-200 ${
                canGoNext
                  ? 'border-black text-black hover:bg-black hover:text-white'
                  : 'border-gray-300 text-gray-300 pointer-events-none'
              }`}
              aria-disabled={!canGoNext}
            >
              Next
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
