'use client';

import { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

interface Props {
  onClose: () => void;
  primaryColor: string;
}

type View = 'login' | 'forgotPassword' | 'resetSent';

export default function LoginModal({ onClose, primaryColor }: Props) {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [view]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/portal/app';
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code.includes('invalid-credential') || code.includes('user-not-found') || code.includes('wrong-password')) {
        setError('Fel e-post eller lösenord.');
      } else if (code.includes('too-many-requests')) {
        setError('För många försök. Försök igen senare.');
      } else {
        setError('Något gick fel. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email) { setError('Ange din e-postadress.'); return; }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setView('resetSent');
    } catch {
      setError('Kunde inte skicka återställningsmail. Kontrollera e-postadressen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
              {view === 'resetSent' ? 'Klart!' : view === 'forgotPassword' ? 'Återställ lösenord' : 'Logga in'}
            </h2>
            <button onClick={onClose} aria-label="Stäng" className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {view === 'resetSent' ? (
            <div className="text-center py-4">
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                Vi har skickat ett återställningsmail till <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setView('login')}
                className="text-[10px] font-black uppercase tracking-widest transition-colors"
                style={{ color: primaryColor }}
              >
                Tillbaka till inloggning
              </button>
            </div>
          ) : view === 'forgotPassword' ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">E-post</label>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold focus:ring-2 focus:outline-none text-zinc-900 dark:text-white transition-all"
                  style={{ ['--tw-ring-color' as string]: `${primaryColor}33` }}
                  placeholder="din@email.se"
                />
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800/50">
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide text-center">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-black py-5 rounded-xl text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Skickar...' : 'Skicka återställningsmail'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => { setView('login'); setError(''); }}
                  className="text-[10px] font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest transition-colors">
                  Tillbaka till inloggning
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">E-post</label>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold focus:ring-2 focus:outline-none text-zinc-900 dark:text-white transition-all"
                  placeholder="din@email.se"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lösenord</label>
                  <span className="text-[9px] font-bold text-zinc-400 italic">inte din pinkod</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold focus:ring-2 focus:outline-none text-zinc-900 dark:text-white transition-all"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800/50">
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide text-center">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-black py-5 rounded-xl text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Loggar in...' : 'Logga in'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => { setView('forgotPassword'); setError(''); }}
                  className="text-[10px] font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest transition-colors">
                  Glömt lösenordet?
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
