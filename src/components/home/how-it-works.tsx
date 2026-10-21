import type { Dictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/reveal";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section id="how" className="border-t border-line bg-forest text-soft">
      <div className="container-x py-14 lg:py-28">
        <Reveal className="max-w-xl">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-sage">{dict.how.kicker}</p>
          <h2 className="mt-3 font-serif text-[2rem] leading-[1.12] tracking-[-0.025em] sm:text-4xl">{dict.how.title}</h2>
        </Reveal>
        <ol className="mt-8 grid gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-10">
          {dict.how.steps.map((step, i) => (
            <li key={step.num} className="border-t border-soft/20 pt-4 lg:pt-6">
              <Reveal delay={i * 0.05}>
                <span className="font-serif text-2xl text-sage lg:text-3xl">{step.num}</span>
                <h3 className="mt-2 font-serif text-2xl lg:mt-4 lg:text-3xl">{step.title}</h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-soft/80 lg:mt-3">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-6 border-t border-soft/20 pt-8 md:grid-cols-2 lg:mt-16 lg:gap-8 lg:pt-10">
          <div>
            <p className="font-medium">{dict.how.options.pickup.title}</p>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-soft/75">{dict.how.options.pickup.text}</p>
          </div>
          <div>
            <p className="font-medium">{dict.how.options.area.title}</p>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-soft/75">{dict.how.options.area.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
