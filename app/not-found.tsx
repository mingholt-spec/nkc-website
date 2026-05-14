import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="text-6xl font-bold text-zinc-900">404</h1>
      <p className="mt-4 text-xl text-zinc-500">Sidan hittades inte.</p>
      <Link href="/" className="mt-8 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
        Tillbaka till startsidan
      </Link>
    </div>
  );
}
