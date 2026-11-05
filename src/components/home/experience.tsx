import type { Dictionary } from "@/i18n/dictionaries";
import { EditorialPhoto } from "@/components/media/editorial-photo";
import { Reveal } from "@/components/ui/reveal";

export function Experience({ dict }: { dict: Dictionary }) {
  return (
    <section id="experience" className="border-t border-line bg-soft">
      <div className="container-x py-14 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker">{dict.experience.kicker}</p>
          <h2 className="display mt-4 text-balance text-[2rem] sm:text-4xl lg:text-[2.75rem]">
            {dict.experience.title}
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.experience.sub}</p>
        </Reveal>

        <Reveal delay={0.06} className="mx-auto mt-10 max-w-5xl lg:mt-14">
          <EditorialPhoto
            src="/images/pexels-emanuele-ricciardi-2149743726-37989788.jpg"
            alt={dict.experience.imageAlt}
            caption={dict.experience.photoCredit}
            className="aspect-video w-full overflow-hidden"
            imageClassName="object-cover grayscale contrast-[1.05]"
            sizes="(min-width: 1024px) 960px, 100vw"
            priority={false}
          />
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-10 max-w-2xl text-center lg:mt-14">
          <p className="font-display text-[1.65rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2rem]">
            {dict.experience.tagline}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-stone sm:text-[16px]">{dict.experience.promise}</p>
        </Reveal>
      </div>
    </section>
  );
}
