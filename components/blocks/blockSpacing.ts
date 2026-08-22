import type { BlockSpacing, SpacingSize } from '@/lib/types';

const SIZE_PX: Record<SpacingSize, string> = {
    '0': '0px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '48px',
    '2xl': '64px',
};

export function spacingToStyle(
    padding?: BlockSpacing,
    margin?: BlockSpacing,
    defaultPadding?: { x?: string; y?: string },
): React.CSSProperties {
    const style: React.CSSProperties = {};

    // Padding — om inget anges, använd default-värden (fallback till befintlig hårdkodad padding)
    if (padding && (padding.top || padding.right || padding.bottom || padding.left)) {
        style.paddingTop = SIZE_PX[padding.top || '0'];
        style.paddingRight = SIZE_PX[padding.right || '0'];
        style.paddingBottom = SIZE_PX[padding.bottom || '0'];
        style.paddingLeft = SIZE_PX[padding.left || '0'];
    } else if (defaultPadding) {
        if (defaultPadding.x) {
            style.paddingLeft = defaultPadding.x;
            style.paddingRight = defaultPadding.x;
        }
        if (defaultPadding.y) {
            style.paddingTop = defaultPadding.y;
            style.paddingBottom = defaultPadding.y;
        }
    }

    // Margin
    if (margin && (margin.top || margin.right || margin.bottom || margin.left)) {
        style.marginTop = SIZE_PX[margin.top || '0'];
        style.marginRight = SIZE_PX[margin.right || '0'];
        style.marginBottom = SIZE_PX[margin.bottom || '0'];
        style.marginLeft = SIZE_PX[margin.left || '0'];
    }

    return style;
}

/** Returnerar sant om en BlockSpacing har minst ett värde satt */
export function hasSpacing(s?: BlockSpacing): boolean {
    return !!(s && (s.top || s.right || s.bottom || s.left));
}
