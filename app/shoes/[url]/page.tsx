import { getShoeByUrl } from '@/lib/contentstack';
import ShoeDetail from '@/components/ShoeDetail';
import { notFound } from 'next/navigation';

export default async function ShoeDetails({ params }: { params: Promise<{ url: string }> }) {
  const { url } = await params;
  const shoe = await getShoeByUrl(url);

  if (!shoe) return notFound();

  return <ShoeDetail initialShoe={shoe} shoeUrl={url} />;
}
