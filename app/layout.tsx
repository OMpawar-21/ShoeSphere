import './globals.css';
import { getGlobalConfig } from '@/lib/contentstack';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getGlobalConfig();

  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        <AnnouncementBar data={config.announcement_bar} />
        <Navbar data={config.header} />
        {children}
        <Footer data={config.footer} />
      </body>
    </html>
  );
}