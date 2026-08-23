import Image from 'next/image';
import type { PageBlockInstructor } from '@/lib/types';
import { spacingToStyle } from './blockSpacing';
import { blockStyleToCSS, blockStyleToScopedCSS } from './blockStyle';

interface Props { block: PageBlockInstructor }

export default function InstructorBlock({ block }: Props) {
  const sectionStyle = { ...spacingToStyle(block.padding, block.margin, { x: '24px', y: '48px' }), ...blockStyleToCSS(block.style) };
  const scopedCss = blockStyleToScopedCSS(block.id, block.style);

  return (
    <section id={`block-${block.id}`} style={sectionStyle}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left px-6">
        {block.image ? (
          <div className="relative w-28 h-28 rounded-full overflow-hidden flex-shrink-0">
            <Image src={block.image} alt={block.instructorName} fill sizes="112px" className="object-cover" />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </div>
        )}
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">{block.instructorName}</h3>
          {block.role && <p className="text-sm text-red-600 font-bold mt-0.5">{block.role}</p>}
          {block.bio && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{block.bio}</p>}
          {block.socialLinks && block.socialLinks.length > 0 && (
            <div className="mt-4 flex gap-2 justify-center sm:justify-start">
              {block.socialLinks.filter(l => l.url).map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-[10px] font-black uppercase transition-colors"
                  title={link.platform}
                >
                  {link.platform.slice(0, 2)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
