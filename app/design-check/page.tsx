import type { Metadata } from "next";

// Internal design-system smoke test — renders the frozen tokens for review.
// Not linked from anywhere; noindex. Remove or gate before cutover.
export const metadata: Metadata = {
  title: "Design Check",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "background", varName: "--color-background", hex: "#040303" },
  { name: "surface", varName: "--color-surface", hex: "#111111" },
  { name: "accent / JB yellow", varName: "--color-accent", hex: "#FECF0E" },
  { name: "foreground", varName: "--color-foreground", hex: "#FFFFFF" },
  { name: "muted", varName: "--color-muted", hex: "#9A9AA0" },
  { name: "border", varName: "--color-border", hex: "#231F20" },
];

export default function DesignCheck() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 flex flex-col gap-16">
      {/* Type */}
      <section className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          Type — frozen roles
        </p>
        <h1
          className="text-7xl md:text-8xl leading-none uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Playing With Fire®
        </h1>
        <h2
          className="text-2xl font-medium uppercase tracking-wide"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Premium cannabis · Since 2006{" "}
          <span className="text-[var(--color-muted)] normal-case text-base">
            (Lemon Milk Pro stand-in)
          </span>
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-foreground-soft)]">
          Body text in DM Sans. The Jungle Boys started as a small group of
          growers in Los Angeles and built one of the most recognized cannabis
          brands in the world — this paragraph exists to judge long-form
          readability at real sizes, line-height 1.65, on the near-black
          background.
        </p>
      </section>

      {/* Color */}
      <section className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          Color — global palette (category accents live only on product pages)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {swatches.map((s) => (
            <div
              key={s.name}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden"
            >
              <div className="h-20" style={{ background: `var(${s.varName})` }} />
              <div className="p-3 text-sm bg-[var(--color-surface)]">
                <div className="font-medium">{s.name}</div>
                <div className="text-[var(--color-muted)]">{s.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive */}
      <section className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          Buttons — accent pairing rules
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            className="cursor-pointer rounded-[var(--radius-sm)] px-8 py-4 text-sm font-bold uppercase tracking-wider transition-transform duration-200 hover:scale-[1.03] bg-[var(--color-accent)] text-[var(--color-on-accent)]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Shop Now
          </button>
          <button
            className="cursor-pointer rounded-[var(--radius-sm)] px-8 py-4 text-sm font-bold uppercase tracking-wider border border-[var(--color-accent)] text-[var(--color-accent)] transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Find Products
          </button>
        </div>
      </section>
    </main>
  );
}
