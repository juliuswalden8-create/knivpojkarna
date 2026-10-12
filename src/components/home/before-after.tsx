import type { Dictionary } from "@/i18n/dictionaries";
import { PhotoWell } from "@/components/media/editorial-photo";
import { Reveal } from "@/components/ui/reveal";

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
          <PhotoWell
            label={`${dict.beforeAfter.placeholderTitle}. ${dict.beforeAfter.placeholderText}`}
            className="min-h-[380px] lg:min-h-[520px]"
          />
        </Reveal>
      </div>
    </section>
  );
}
