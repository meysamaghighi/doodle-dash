import Link from "next/link";

export type CrossPromoLink = {
  emoji: string;
  label: string;
  blurb: string;
  href: string;
};

/**
 * Cross-promo destinations for the sibling BenchMyBrain product.
 * `utm_content` distinguishes placement (footer vs post-game) in GA4.
 */
export function crossPromoLinks(utmContent: string): CrossPromoLink[] {
  return [
    {
      emoji: "🧠",
      label: "BenchMyBrain",
      blurb: "40 free brain tests",
      href: `https://benchmybrain.com?utm_source=doodlelab&utm_medium=crosspromo&utm_content=${utmContent}`,
    },
    {
      emoji: "🗼",
      label: "Stack Tower",
      blurb: "Free Android game",
      href: `https://benchmybrain.com/stack-tower?utm_source=doodlelab&utm_medium=crosspromo&utm_content=${utmContent}`,
    },
  ];
}

/** Discreet pill row, matches the footer's "Sibling sites" idiom. */
export function CrossPromoFooterLinks() {
  return (
    <>
      {crossPromoLinks("footer").map((item) => (
        <Link
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener"
          className="px-4 py-1.5 border border-line rounded-full text-sm text-ink hover:bg-paper-2 transition-colors"
        >
          {item.emoji} {item.label} · {item.blurb}
        </Link>
      ))}
    </>
  );
}

/** Slightly more visible card strip. Used on the homepage. */
export function CrossPromoCard({ utmContent }: { utmContent: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3 mb-2 text-center">
        More from the maker
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {crossPromoLinks(utmContent).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line bg-paper text-left hover:border-ink-3 transition-colors"
          >
            <span className="text-lg leading-none">{item.emoji}</span>
            <span className="leading-tight">
              <span className="block text-xs font-medium text-ink">{item.label}</span>
              <span className="block text-[11px] text-ink-3">{item.blurb}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
