'use client';

import { ContentstackHeader } from '@/types/contentstack';
import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  data?: ContentstackHeader;
}

export default function Navbar({ data }: NavbarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = (menuKey: string) => {
    setOpenMenu((current) => (current === menuKey ? null : menuKey));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
          >
            {data?.logo?.url ? (
              <img 
                src={data.logo.url} 
                alt={data.logo.title || 'Logo'} 
                className="h-10 lg:h-14 w-auto transition-opacity duration-200 hover:opacity-80" 
              />
            ) : (
              <span className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-black">
                SHOES
              </span>
            )}
          </Link>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {data?.nav_menu?.map((menuItem, index) => (
              <div 
                key={index}
                className="relative"
              >
                {menuItem.sub_links && menuItem.sub_links.length > 0 ? (
                  <>
                    <button
                      className="text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
                      onClick={() => toggleMenu(`${index}`)}
                      aria-expanded={openMenu === `${index}`}
                      aria-haspopup="true"
                      type="button"
                    >
                      {menuItem.title}
                    </button>
                    {openMenu === `${index}` && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-xl border border-gray-200 py-4 animate-fade-in">
                        {menuItem.sub_links.map((subLink, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subLink.url}
                            className="block px-6 py-2 text-sm text-black hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setOpenMenu(null)}
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="#"
                    className="text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
                    onClick={() => setOpenMenu(null)}
                  >
                    {menuItem.title}
                  </Link>
                )}
              </div>
            ))}
            <Link
              href="/categories"
              className="text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors duration-200 py-2"
            >
              All Categories
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Search Icon */}
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setIsSearchOpen((current) => !current)}
              aria-expanded={isSearchOpen}
              aria-controls="navbar-search"
            >
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Cart Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 relative">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center">0</span>
            </button>

            {/* User Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Menu Toggle for Mobile */}
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        <div
          id="navbar-search"
          className={`overflow-hidden transition-all duration-300 ${
            isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shoes..."
                className="w-full border-2 border-gray-200 px-4 py-3 text-sm focus:border-black outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Enter
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

