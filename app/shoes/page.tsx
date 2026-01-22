import { getEntriesWithCount } from '@/lib/contentstack';
import { ContentstackShoe } from '@/types/contentstack';
import ShoesGrid from '@/components/ShoesGrid';

const PAGE_SIZE = 4;

export default async function ShoesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedParams?.page || 1));
  const skip = (currentPage - 1) * PAGE_SIZE;

  // Fetch with base variant initially
  const { entries: shoes, count } = await getEntriesWithCount<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
    queryBuilder: (query) => query.skip(skip).limit(PAGE_SIZE),
  });

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-white">
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-black mb-2">
              All Shoes
            </h1>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>

          <ShoesGrid 
            initialShoes={shoes}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </section>
    </main>
  );
}
