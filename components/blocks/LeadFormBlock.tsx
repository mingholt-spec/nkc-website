'use client';

import { useState, useRef } from 'react';
import type { PageBlockLeadForm } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface Props {
  block: PageBlockLeadForm;
  campaignId?: string;
  campaignName?: string;
}

const T = {
  sv: {
    required: 'Detta fält är obligatoriskt',
    invalidEmail: 'Ogiltig e-postadress',
    rateLimited: 'Vänta en stund innan du skickar igen.',
    somethingWentWrong: 'Något gick fel. Försök igen.',
    sending: 'Skickar...',
    submit: 'Skicka',
    successDefault: 'Tack! Vi hör av oss.',
    gdprText: 'Jag godkänner att mina personuppgifter lagras och behandlas i enlighet med GDPR.',
    guardianInfo: 'Målsmans uppgifter',
    guardianName: 'Namn', guardianEmail: 'E-post', guardianPhone: 'Telefon',
  },
  en: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    rateLimited: 'Please wait a moment before sending again.',
    somethingWentWrong: 'Something went wrong. Please try again.',
    sending: 'Sending...',
    submit: 'Send',
    successDefault: "Thanks! We'll be in touch.",
    gdprText: 'I agree that my personal data is stored and processed in accordance with GDPR.',
    guardianInfo: "Guardian's details",
    guardianName: 'Name', guardianEmail: 'Email', guardianPhone: 'Phone',
  },
};

const inputClasses = 'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors border-zinc-200 dark:border-white/15 bg-white dark:bg-white/5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40 focus:border-zinc-400 dark:focus:border-white/30';
const inputErrorClasses = 'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40';

export default function LeadFormBlock({ block, campaignId, campaignName }: Props) {
  const lang = useLanguage();
  const t = T[lang];

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const submitTimesRef = useRef<number[]>([]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of block.fields) {
      if (field.type === 'guardianInfo') {
        if (field.required && !(formData.guardianEmail || '').trim()) newErrors[field.id] = t.required;
        continue;
      }
      const value = (formData[field.key] || '').trim();
      if (field.required && !value) newErrors[field.id] = t.required;
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[field.id] = t.invalidEmail;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (honeypotRef.current?.value) return; // honeypot

    const now = Date.now();
    submitTimesRef.current = submitTimesRef.current.filter(ts => now - ts < 60000);
    if (submitTimesRef.current.length >= 3) {
      setSubmitError(t.rateLimited);
      return;
    }
    submitTimesRef.current.push(now);

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/lead-form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: formData, tags: block.tags, campaignId, campaignName }),
      });
      if (!res.ok) throw new Error('server error');
      if (block.redirectUrl) {
        window.location.href = block.redirectUrl;
        return; // lämna submitting=true — sidan navigerar bort ändå
      }
      setSubmitted(true);
    } catch {
      setSubmitError(t.somethingWentWrong);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{block.successMessage || t.successDefault}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      {block.title && <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-center text-zinc-900 dark:text-zinc-100">{block.title}</h2>}
      {block.description && <p className="text-sm text-zinc-900 dark:text-zinc-100 opacity-70 mb-6 text-center">{block.description}</p>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" ref={honeypotRef} />
        </div>

        {block.fields.map(field => field.type === 'guardianInfo' ? (
          <div key={field.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{field.label || t.guardianInfo}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={formData.guardianName || ''} onChange={e => handleChange('guardianName', e.target.value)} placeholder={t.guardianName} required={field.required} className={errors[field.id] ? inputErrorClasses : inputClasses} />
              <input type="email" value={formData.guardianEmail || ''} onChange={e => handleChange('guardianEmail', e.target.value)} placeholder={t.guardianEmail} required={field.required} className={errors[field.id] ? inputErrorClasses : inputClasses} />
              <input type="tel" value={formData.guardianPhone || ''} onChange={e => handleChange('guardianPhone', e.target.value)} placeholder={t.guardianPhone} required={field.required} className={errors[field.id] ? inputErrorClasses : inputClasses} />
            </div>
            {errors[field.id] && <p className="text-xs text-red-500 mt-1 font-medium">{errors[field.id]}</p>}
          </div>
        ) : (
          <div key={field.id}>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-zinc-900 dark:text-zinc-100 opacity-70">
              {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
                rows={4}
                className={`${errors[field.id] ? inputErrorClasses : inputClasses} resize-y`}
              />
            ) : (
              <input
                type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
                value={formData[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
                className={errors[field.id] ? inputErrorClasses : inputClasses}
              />
            )}
            {errors[field.id] && <p className="text-xs text-red-500 mt-1 font-medium">{errors[field.id]}</p>}
          </div>
        ))}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={gdprAccepted}
            onChange={e => setGdprAccepted(e.target.checked)}
            required
            className="mt-0.5 w-5 h-5 rounded border-zinc-200 dark:border-white/20 shrink-0"
          />
          <span className="text-[11px] leading-relaxed text-zinc-900 dark:text-zinc-100 opacity-60">{t.gdprText}</span>
        </label>

        {submitError && <p className="text-sm text-red-500 font-medium">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting || !gdprAccepted}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg disabled:opacity-50"
        >
          {submitting ? t.sending : (block.submitLabel || t.submit)}
        </button>
      </form>
    </section>
  );
}
