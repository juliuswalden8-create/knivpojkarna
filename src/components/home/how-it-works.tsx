import type { Dictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/reveal";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section id="how" className="border-t border-line bg-ivory">
      <div className="container-x py-20 lg:py-28">
        <Reveal className="max-w-xl">
          <p className="kicker">{dict.how.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.how.title}</h2>
        </Reveal>
        <ol className="mt-14 divide-y divide-line border-y border-line">
          {dict.how.steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.05}>
              <li className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr_1.4fr] sm:items-baseline">
                <span className="font-serif text-2xl text-stone">{step.num}</span>
                <h3 className="font-serif text-2xl sm:text-[1.75rem]">{step.title}</h3>
                <p className="max-w-md text-[15px] leading-relaxed text-stone">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <p className="font-medium">{dict.how.options.pickup.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-stone">{dict.how.options.pickup.text}</p>
          </div>
          <div>
            <p className="font-medium">{dict.how.options.area.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-stone">{dict.how.options.area.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
