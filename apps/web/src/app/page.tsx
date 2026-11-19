import { formatMessageHtml } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default function HomePage() {
  return (
    <div className="m-1 p-5" dangerouslySetInnerHTML={{__html: formatMessageHtml(process.env.INFORMATION ?? '')}}></div>
  );
}