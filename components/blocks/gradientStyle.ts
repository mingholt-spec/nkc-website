/**
 * Delad logik för att låta bakgrunds- och textfärgsfält lagra antingen en
 * vanlig färg ELLER en CSS-gradient i samma sträng-fält (t.ex. `block.titleColor`,
 * `block.style.backgroundColor`) — ingen schemaändring krävs, CSS `background`
 * (till skillnad från `background-color`) accepterar båda direkt.
 *
 * VIKTIGT: Identisk kopia finns i
 * bjj-premium/components/public/blocks/gradientStyle.ts (admin-portalens
 * förhandsvisning) — den här filen renderar den RIKTIGA publika sidan. Håll
 * de två i synk om logiken ändras.
 */

export function isGradientValue(v?: string): boolean {
    return !!v && (v.startsWith('linear-gradient(') || v.startsWith('radial-gradient('));
}

/** Bakgrundsfärg ELLER -gradient — `background` accepterar båda formaten. */
export function backgroundStyleValue(v?: string): React.CSSProperties {
    return v ? { background: v } : {};
}

/** Textfärg ELLER -gradient. Vanlig `color` accepterar inte gradienter, så en
 *  gradient-sträng aktiverar `background-clip: text`-knepet istället. */
export function textColorStyleValue(v?: string): React.CSSProperties {
    if (!v) return {};
    if (!isGradientValue(v)) return { color: v };
    return {
        backgroundImage: v,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
    };
}
