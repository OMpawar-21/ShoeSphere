import { getAllShoes, getCategoriesBySlug, getEntriesWithCount } from '@/lib/contentstack';
import { ContentstackShoe } from '@/types/contentstack';
import CategoryShoesGrid from '@/components/CategoryShoesGrid';
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

  // Fallback: if no results from query, try filtering all shoes
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

          <CategoryShoesGrid
            initialShoes={shoes}
            categoryUids={categoryUids}
            slug={slug}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </section>
    </main>
  );
}
