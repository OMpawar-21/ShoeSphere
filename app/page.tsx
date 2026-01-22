import { getHomepage, getAllShoes } from '@/lib/contentstack';
import Link from 'next/link';
import HomeShoeGrid from '@/components/HomeShoeGrid';

export default async function Home() {
  const homepage = await getHomepage();
  const allShoes = await getAllShoes();
  
  // Use featured shoes from homepage if available, otherwise use all shoes
  const shoes = homepage?.featured_shoes && homepage.featured_shoes.length > 0 
    ? homepage.featured_shoes 
    : allShoes;

  const sectionTitle = homepage?.featured_shoes && homepage.featured_shoes.length > 0 
    ? 'Featured Collection' 
    : 'Latest Drops';

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Adidas Style */}
      {homepage?.hero_section && (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
          {homepage.hero_section.bg_media?.url && (
            <div className="absolute inset-0 z-0">
              {homepage.hero_section.bg_media.url.endsWith('.mp4') || 
               homepage.hero_section.bg_media.url.endsWith('.webm') ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90"
                >
                  <source src={homepage.hero_section.bg_media.url} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={homepage.hero_section.bg_media.url}
                  alt={homepage.hero_section.bg_media.title || 'Hero background'}
                  className="w-full h-full object-cover opacity-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
            </div>
          )}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            {homepage.hero_section.headline && (
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white mb-6 leading-tight animate-fade-in">
                {homepage.hero_section.headline}
              </h1>
            )}
            {homepage.hero_section.sub_headline && (
              <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-10 font-light tracking-wide animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {homepage.hero_section.sub_headline}
              </p>
            )}
            {homepage.hero_section.cta_button?.cta_text && homepage.hero_section.cta_button?.cta_link && (
              <Link
                href={homepage.hero_section.cta_button.cta_link}
                className="inline-block px-10 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black border-2 border-white hover:border-black transition-all duration-300 hover:scale-105 shadow-2xl animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                {homepage.hero_section.cta_button.cta_text}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section - Adidas Grid Style */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-black mb-2">
              {sectionTitle}
            </h2>
            <div className="w-20 h-1 bg-black mx-auto"></div>
            <div className="mt-6">
              <Link
                href="/shoes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all duration-300"
              >
                View All Shoes
              </Link>
            </div>
          </div>
          
          {/* Client component for dynamic currency support */}
          <HomeShoeGrid initialShoes={shoes} title={sectionTitle} />
        </div>
      </section>
    </main>
  );
}
