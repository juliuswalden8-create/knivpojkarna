import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

function ComparisonPhoto({
  src,
  alt,
  label,
  className,
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[4/3] bg-offwhite-200", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 36vw, 100vw"
      />
      <span className="absolute left-3 top-3 bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-ivory">
        {label}
      </span>
    </div>
  );
}

export function BeforeAfter({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-t border-line bg-ivory">
      <div className="container-x grid items-start gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <Reveal>
          <p className="kicker">{dict.beforeAfter.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.beforeAfter.title}</h2>
          <h3 className="mt-10 font-serif text-2xl">{dict.beforeAfter.eduTitle}</h3>
          {dict.beforeAfter.eduParagraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 text-[16px] leading-relaxed text-stone">
              {p}
            </p>
          ))}
          <ul className="mt-8 space-y-3">
            {dict.beforeAfter.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-[15px] text-ink">
                <span className="mt-2 h-px w-6 shrink-0 bg-ember" />
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.06}>
          <figure>
            <div className="border border-line">
              <ComparisonPhoto
                src="/images/before-dull.jpg"
                alt={dict.beforeAfter.beforeAlt}
                label={dict.beforeAfter.before}
              />
              <ComparisonPhoto
                src="/images/after-sharp.jpg"
                alt={dict.beforeAfter.afterAlt}
                label={dict.beforeAfter.after}
                className="border-t border-line"
              />
            </div>
            <figcaption className="mt-3 text-[11px] leading-relaxed tracking-[0.04em] text-stone">
              {dict.beforeAfter.illustrative}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
