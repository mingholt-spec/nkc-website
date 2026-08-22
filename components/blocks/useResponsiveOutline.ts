import { useEffect, type RefObject } from 'react';

/**
 * Hook som applicerar responsiv text-outline:
 * tunnare på mobil (< 768px), full bredd på desktop.
 */
export function useResponsiveOutline(
    ref: RefObject<HTMLElement | null>,
    desktopShadow?: string,
    mobileShadow?: string,
) {
    useEffect(() => {
        if (!ref.current || !mobileShadow || !desktopShadow) return;
        const el = ref.current;
        const mq = window.matchMedia('(min-width: 768px)');

        const apply = (e: { matches: boolean }) => {
            el.style.textShadow = e.matches ? desktopShadow : mobileShadow;
        };

        apply(mq);
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, [ref, desktopShadow, mobileShadow]);
}
