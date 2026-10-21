import type { Dictionary } from "@/i18n/dictionaries";
import { Reveal } from "@/components/ui/reveal";

export function Why({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-t border-line bg-soft">
      <div className="container-x py-20 lg:py-24">
        <Reveal className="max-w-xl">
          <p className="kicker">{dict.why.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.why.title}</h2>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {dict.why.items.map((item) => (
            <div key={item.title} className="border-t border-line pt-5">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-stone">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
