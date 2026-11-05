import type { Dictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/reveal";

export function Why({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-t border-line bg-ivory">
      <div className="container-x py-14 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker">{dict.why.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.why.title}</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {dict.why.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="h-full border-t border-line pt-5">
                <span className="font-display text-[13px] font-semibold tracking-[0.16em] text-orange">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-[1.15rem] font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-stone">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
