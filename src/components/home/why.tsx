import type { Dictionary } from "@/i18n/dictionaries";
import { EditorialPhoto } from "@/components/media/editorial-photo";
import { Reveal } from "@/components/ui/reveal";

export function Why({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-t border-line bg-soft">
      <div className="container-x grid items-start gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <Reveal className="lg:col-span-5">
          <p className="kicker">{dict.why.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.why.title}</h2>
          <div className="mt-10 space-y-8">
            {dict.why.items.map((item) => (
              <div key={item.title}>
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-stone">{item.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="grid gap-4 lg:col-span-6 lg:col-start-7">
          <EditorialPhoto
            src="/images/knife-set.jpg"
            alt={dict.hero.imageAlt}
            caption={dict.hero.photoCredit}
            className="aspect-[5/4]"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <EditorialPhoto
            src="/images/hero-sharpening.jpg"
            alt={dict.hero.imageAlt}
            className="aspect-[16/9]"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
