import './globals.css';
import { getGlobalConfig } from '@/lib/contentstack';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getGlobalConfig();

  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        <CurrencyProvider>
          <AnnouncementBar data={config.announcement_bar} />
          <Navbar data={config.header} />
          {children}
          <Footer data={config.footer} />
        </CurrencyProvider>
      </body>
    </html>
  );
}