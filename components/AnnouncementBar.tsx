import { ContentstackAnnouncementBar } from '@/types/contentstack';
import Link from 'next/link';

interface AnnouncementBarProps {
  data?: ContentstackAnnouncementBar;
}

export default function AnnouncementBar({ data }: AnnouncementBarProps) {
  if (!data?.text) return null;

  const bgColor = data.bg_color || '#000000';

  return (
    <div 
      className="w-full py-2 text-center text-sm font-semibold text-white"
      style={{ backgroundColor: bgColor }}
    >
      {data.link ? (
        <Link 
          href={data.link}
          className="hover:underline transition-all duration-200"
        >
          {data.text}
        </Link>
      ) : (
        <span>{data.text}</span>
      )}
    </div>
  );
}
