export interface ContentstackImage {
  url: string;
  title?: string;
  description?: string;
}

export interface ContentstackLink {
  title: string;
  href: string;
}

// Announcement Bar
export interface ContentstackAnnouncementBar {
  text?: string;
  link?: string;
  bg_color?: string;
}

// Navigation Sub Link
export interface ContentstackSubLink {
  label: string;
  url: string;
}

// Navigation Menu Item
export interface ContentstackNavMenuItem {
  title: string;
  sub_links?: ContentstackSubLink[];
}

// Header
export interface ContentstackHeader {
  logo?: ContentstackImage;
  nav_menu?: ContentstackNavMenuItem[];
}

// Footer Column Link
export interface ContentstackFooterLink {
  link_title: string;
  url: string;
}

// Footer Column
export interface ContentstackFooterColumn {
  title: string;
  links?: ContentstackFooterLink[];
}

// Footer
export interface ContentstackFooter {
  columns?: ContentstackFooterColumn[];
  copyright?: string;
}

// Site Config
export interface ContentstackSiteConfig {
  announcement_bar?: ContentstackAnnouncementBar;
  header?: ContentstackHeader;
  footer?: ContentstackFooter;
}

// Hero Section
export interface ContentstackHeroSection {
  headline?: string;
  sub_headline?: string;
  bg_media?: ContentstackImage;
  cta_button?: {
    cta_text?: string;
    cta_link?: string;
  };
}

// Homepage
export interface ContentstackHomepage {
  uid: string;
  url: string;
  hero_section?: ContentstackHeroSection;
  featured_shoes?: ContentstackShoe[];
}

export interface ContentstackBrand {
  uid: string;
  title: string;
}

export interface ContentstackSeller {
  uid: string;
  name: string;
  email?: string;
  description?: string;
  phone?: string;
  address?: string;
  image?: ContentstackImage;
}

export interface ContentstackCategory {
  uid: string;
  title: string;
  shoe_type?: string[];
  brand?: ContentstackBrand;
}

export interface ContentstackMaterial {
  uid: string;
  title: string;
  care_instructions?: string;
}

export interface ContentstackTestimonial {
  title: string;
  rating: number;
  feedback: string;
  user_photo?: ContentstackImage;
  seller_email?: string;
}

export interface ContentstackShoe {
  uid: string;
  title: string;
  url: string;
  price: number;
  description?: string;
  main_image: ContentstackImage;
  brand_ref?: ContentstackBrand | ContentstackBrand[];
  seller_ref?: ContentstackSeller | ContentstackSeller[];
  category_ref?: ContentstackCategory | ContentstackCategory[];
  material_ref?: ContentstackMaterial[];
  weight?: string;
  heel_height?: string;
  size?: string[];
  testimonials?: ContentstackTestimonial[];
  color?: string; // Color field for personalization (e.g., "Base", "Red", "Black")
}
