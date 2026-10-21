import type { Dictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/reveal";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section id="how" className="border-t border-line bg-forest text-soft">
      <div className="container-x py-20 lg:py-28">
        <Reveal className="max-w-xl">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-sage">{dict.how.kicker}</p>
          <h2 className="mt-3 font-serif text-[2rem] leading-[1.12] tracking-[-0.025em] sm:text-4xl">{dict.how.title}</h2>
        </Reveal>
        <ol className="mt-14 grid gap-10 lg:grid-cols-3">
          {dict.how.steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.05}>
              <li className="border-t border-soft/20 pt-6">
                <span className="font-serif text-3xl text-sage">{step.num}</span>
                <h3 className="mt-4 font-serif text-3xl">{step.title}</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-soft/80">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-16 grid gap-8 border-t border-soft/20 pt-10 md:grid-cols-2">
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
