import { ContentstackFooter } from '@/types/contentstack';
import Link from 'next/link';

interface FooterProps {
  data?: ContentstackFooter;
}

export default function Footer({ data }: FooterProps) {
  const columnCount = data?.columns?.length || 0;
  
  return (
    <footer className="mt-16 sm:mt-20 bg-black text-white">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-20">
          
          {/* Brand Section */}
          <div className="flex-shrink-0 lg:max-w-xs space-y-5">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              ShoeSphere
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your destination for premium footwear. Discover the latest styles and personalized shopping.
            </p>
          </div>

          {/* Navigation Columns from CMS */}
          {data?.columns && data.columns.length > 0 && (
            <div className={`grid ${columnCount === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-10 lg:gap-16`}>
              {data.columns.map((column, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                    {column.title}
                  </h3>
                  {column.links && column.links.length > 0 && (
                    <ul className="space-y-3">
                      {column.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.url}
                            className="text-sm text-gray-400 hover:text-white transition-colors duration-200 block"
                          >
                            {link.link_title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center uppercase tracking-wider">
            {data?.copyright || '© 2024 ShoeSphere. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

