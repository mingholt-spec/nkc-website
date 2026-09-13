'use client';
import { useT } from '@/lib/translations';

export default function EmptyHomeState() {
  const t = useT('homePage');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="text-3xl font-bold text-zinc-800">{t.emptyTitle}</h1>
      <p className="mt-3 text-zinc-500">{t.emptyText}</p>
    </div>
  );
}
