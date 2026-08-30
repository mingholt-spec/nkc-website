import type { BlockStyleOptions, BlockStyleBase, HeadingSize } from '@/lib/types';
import { backgroundStyleValue, textColorStyleValue, isGradientValue } from './gradientStyle';

/** Enkel ljushetsberäkning (0–255) för en #hex-färg — bara för att välja en
 *  kontrasterande fast bakgrund, inte för exakt WCAG-kontroll. */
function isDarkHex(hex: string): boolean {
    const clean = hex.replace('#', '');
    if (clean.length !== 3 && clean.length !== 6) return false;
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return false;
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/**
 * En blocks bakgrund ärver normalt sajtens REAKTIVA ljust/mörkt-bakgrund (inget
 * eget värde satt). Text får däremot ofta en FAST färg (block.textColor,
 * style.headlineColor, ...) som inte reagerar på temat. Kombinationen "fast text,
 * reaktiv bakgrund" kan göra texten osynlig när temat växlar (t.ex. mörk text
 * på en bakgrund som blir mörk). Anropa detta med det SLUTGILTIGA upplösta
 * textfärgvärdet (efter alla fallbacks) för att pinna en matchande fast
 * bakgrund i det fallet — ingen effekt om blocket redan har en egen bakgrund.
 */
export function pinBackgroundForFixedText(hasOwnBackground: boolean, resolvedTextColor: string | undefined): React.CSSProperties {
    if (hasOwnBackground || !resolvedTextColor) return {};
    const dark = isGradientValue(resolvedTextColor) ? false : isDarkHex(resolvedTextColor);
    return { backgroundColor: dark ? '#ffffff' : '#18181b' };
}

// ── Border width mappning ──
const BORDER_WIDTH: Record<string, string> = {
    '0': '0px',
    '1': '1px',
    '2': '2px',
    '3': '3px',
    '4': '4px',
};

// ── Border radius mappning ──
const BORDER_RADIUS: Record<string, string> = {
    '0': '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
};

// ── Box shadow mappning ──
const SHADOW: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
};

// ── Text shadow mappning ──
const TEXT_SHADOW: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.2)',
    md: '0 2px 4px rgba(0,0,0,0.3)',
    lg: '0 4px 8px rgba(0,0,0,0.4)',
    glow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)',
};

// ── Typography: Line height ──
const LINE_HEIGHT: Record<string, number> = {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
};

// ── Typography: Letter spacing ──
const LETTER_SPACING: Record<string, string> = {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
};

// ── Typography: Font weight ──
const FONT_WEIGHT: Record<string, number> = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
};

// ── Typography: Font size (inline CSS values) ──
const FONT_SIZE_CSS: Record<string, string> = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
};

/**
 * Konverterar BlockStyleOptions till React CSSProperties för wrapper/container.
 * Returnerar tomt objekt om inga stilar är satta.
 */
export function blockStyleToCSS(style?: BlockStyleOptions): React.CSSProperties {
    if (!style) return {};
    const css: React.CSSProperties = {};

    // Border
    const bw = style.borderWidth;
    if (bw && bw !== '0') {
        css.borderWidth = BORDER_WIDTH[bw] || '0px';
        css.borderStyle = 'solid';
        css.borderColor = style.borderColor || 'var(--block-border-color, #e4e4e7)';
    }

    // Border radius
    if (style.borderRadius && style.borderRadius !== '0') {
        css.borderRadius = BORDER_RADIUS[style.borderRadius] || '0px';
    }

    // Box shadow
    if (style.shadow && style.shadow !== 'none') {
        css.boxShadow = SHADOW[style.shadow] || 'none';
    }

    // Background color (eller -gradient — CSS `background` accepterar båda)
    if (style.backgroundColor) {
        Object.assign(css, backgroundStyleValue(style.backgroundColor));
    } else {
        Object.assign(css, pinBackgroundForFixedText(false, style.headlineColor));
    }

    return css;
}

export function buildOutlineShadow(w: number, c: string): string {
    const shadows: string[] = [];
    for (let i = 1; i <= w; i++) {
        shadows.push(
            `${i}px 0 0 ${c}`, `${-i}px 0 0 ${c}`,
            `0 ${i}px 0 ${c}`, `0 ${-i}px 0 ${c}`,
            `${i}px ${i}px 0 ${c}`, `${-i}px ${-i}px 0 ${c}`,
            `${i}px ${-i}px 0 ${c}`, `${-i}px ${i}px 0 ${c}`,
        );
    }
    return shadows.join(', ');
}

/**
 * Genererar en mobilanpassad outline som är 1 steg tunnare på mobil.
 * Returnerar { mobile, desktop } med separata shadow-strängar.
 */
function responsiveOutlineShadows(style: BlockStyleOptions): { mobile: string; desktop: string } {
    const c = style.textOutlineColor || 'rgba(0,0,0,0.3)';
    const w = style.textOutlineWidth === '2' ? 2 : style.textOutlineWidth === '3' ? 3 : 1;
    const mobileW = Math.max(1, w - 1); // 1 steg tunnare, minst 1px
    return {
        mobile: buildOutlineShadow(mobileW, c),
        desktop: buildOutlineShadow(w, c),
    };
}

/**
 * Resultat från headlineStyleToCSS — inkluderar desktop-stil och
 * optionellt en separat mobilvariant för outline.
 */
export interface HeadlineStyle extends React.CSSProperties {
    /** Om satt, en tunnare outline-shadow för mobil (< md breakpoint) */
    _mobileTextShadow?: string;
}

/**
 * Konverterar text-relaterade stilar (textShadow, textOutline) till CSSProperties
 * som appliceras på headline-element.
 * @param element — 'title' | 'subtitle' bestämmer vilken del av texten. Om utelämnad appliceras allt.
 */
export function headlineStyleToCSS(style?: BlockStyleOptions, element?: 'title' | 'subtitle'): HeadlineStyle {
    if (!style) return {};
    const css: HeadlineStyle = {};

    // Headline color (eller -gradient)
    Object.assign(css, textColorStyleValue(style.headlineColor));

    // Text shadow (bas)
    const baseShadow = (style.textShadow && style.textShadow !== 'none')
        ? (TEXT_SHADOW[style.textShadow] || '')
        : '';

    // Text outline — respektera target (default 'all')
    if (style.textOutline) {
        const target = style.textOutlineTarget || 'all';
        const shouldApply = target === 'all' || target === element || !element;
        if (shouldApply) {
            const resp = responsiveOutlineShadows(style);
            const prefix = baseShadow ? baseShadow + ', ' : '';

            // Desktop (default) — full bredd
            css.textShadow = prefix + resp.desktop;

            // Mobil — tunnare (sparas som custom property, appliceras i komponenten)
            if (resp.mobile !== resp.desktop) {
                css._mobileTextShadow = prefix + resp.mobile;
            }
        } else if (baseShadow) {
            css.textShadow = baseShadow;
        }
    } else if (baseShadow) {
        css.textShadow = baseShadow;
    }

    return css;
}

/** Map HeadingSize → Tailwind responsive class */
export const HEADING_SIZE_CLASSES: Record<HeadingSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm md:text-base',
    'base': 'text-base md:text-lg',
    'lg': 'text-lg md:text-xl',
    'xl': 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl',
    '4xl': 'text-4xl md:text-6xl',
};

export function headingSizeCls(size: HeadingSize | undefined, defaultSize: HeadingSize): string {
    return HEADING_SIZE_CLASSES[size || defaultSize];
}

/**
 * Konverterar typografi-fält i BlockStyleOptions till React CSSProperties.
 * Returnerar tomt objekt om inga typografi-stilar är satta.
 */
export function typographyToCSS(style?: BlockStyleOptions): React.CSSProperties {
    if (!style) return {};
    const css: React.CSSProperties = {};

    if (style.textAlign) {
        css.textAlign = style.textAlign;
    }
    if (style.fontSize && FONT_SIZE_CSS[style.fontSize]) {
        css.fontSize = FONT_SIZE_CSS[style.fontSize];
    }
    if (style.lineHeight && LINE_HEIGHT[style.lineHeight] !== undefined) {
        css.lineHeight = LINE_HEIGHT[style.lineHeight];
    }
    if (style.letterSpacing && LETTER_SPACING[style.letterSpacing]) {
        css.letterSpacing = LETTER_SPACING[style.letterSpacing];
    }
    if (style.fontWeight && FONT_WEIGHT[style.fontWeight]) {
        css.fontWeight = FONT_WEIGHT[style.fontWeight];
    }

    return css;
}

/** camelCase → kebab-case (för att skriva React.CSSProperties-nycklar som riktig CSS-text) */
function cssPropToKebab(prop: string): string {
    return prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

/** Slår ihop container- (blockStyleToCSS) och typografi-CSS (typographyToCSS) till en CSS-deklarationssträng, t.ex. "border-radius:8px;font-weight:700". */
function styleBaseToCSSDeclarations(base?: BlockStyleBase): string {
    if (!base) return '';
    const css: React.CSSProperties = { ...blockStyleToCSS(base as BlockStyleOptions), ...typographyToCSS(base as BlockStyleOptions) };
    return Object.entries(css)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${cssPropToKebab(k)}:${v}`)
        .join(';');
}

/**
 * Genererar en skopad CSS-sträng för ett blocks hover-tillstånd och
 * responsiva brytpunkt-overrides. Returnerar tom sträng om varken
 * `style.hover` eller `style.responsive` är satt — komponenten renderar
 * då ingen extra <style>-tagg alls. Speglar bjj-premiums
 * components/public/blocks/blockStyle.ts.
 */
export function blockStyleToScopedCSS(blockId: string, style?: BlockStyleOptions): string {
    if (!style || (!style.hover && !style.responsive)) return '';
    const sel = `#block-${blockId}`;
    const parts: string[] = [];

    const hoverDecl = styleBaseToCSSDeclarations(style.hover);
    if (hoverDecl) parts.push(`${sel}:hover{${hoverDecl}}`);

    const tabletDecl = styleBaseToCSSDeclarations(style.responsive?.tablet);
    if (tabletDecl) parts.push(`@media (max-width:1024px){${sel}{${tabletDecl}}}`);

    const mobileDecl = styleBaseToCSSDeclarations(style.responsive?.mobile);
    if (mobileDecl) parts.push(`@media (max-width:768px){${sel}{${mobileDecl}}}`);

    return parts.join('\n');
}

/** Returnerar sant om en BlockStyleOptions har minst ett värde satt */
export function hasBlockStyle(s?: BlockStyleOptions): boolean {
    if (!s) return false;
    return !!(
        (s.borderWidth && s.borderWidth !== '0') ||
        s.borderColor ||
        (s.borderRadius && s.borderRadius !== '0') ||
        (s.shadow && s.shadow !== 'none') ||
        s.backgroundColor ||
        s.headlineColor ||
        (s.textShadow && s.textShadow !== 'none') ||
        s.textOutline ||
        s.textAlign ||
        s.fontSize ||
        s.lineHeight ||
        s.letterSpacing ||
        s.fontWeight
    );
}
