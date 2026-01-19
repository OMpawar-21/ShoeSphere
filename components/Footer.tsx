import { ContentstackFooter } from '@/types/contentstack';
import Link from 'next/link';

interface FooterProps {
  data?: ContentstackFooter;
}

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="mt-20 sm:mt-24 lg:mt-32 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {data?.columns && data.columns.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {data.columns.map((column, index) => (
              <div key={index} className="space-y-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-black">
                  {column.title}
                </h3>
                {column.links && column.links.length > 0 && (
                  <ul className="space-y-3">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.url}
                          className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block"
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
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center uppercase tracking-wider">
            {data?.copyright || '© 2024 All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

