import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Brand marks for identification only (see on-page disclaimer).
 * Prefer Wikimedia Commons trademark SVGs where available; otherwise
 * brand-colored wordmarks / lockups that match the public brand identity.
 */
const BRANDS = [
  { name: "Global", src: "/brands/global.svg" },
  { name: "Wüsthof", src: "/brands/wusthof.svg" },
  { name: "Zwilling", src: "/brands/zwilling.svg" },
  { name: "Victorinox", src: "/brands/victorinox.svg" },
  { name: "Fiskars", src: "/brands/fiskars.svg" },
  { name: "IKEA", src: "/brands/ikea.svg" },
  { name: "Yaxell", src: "/brands/yaxell.svg" },
  { name: "Shun", src: "/brands/shun.svg" },
  { name: "Miyabi", src: "/brands/miyabi.svg" },
  { name: "MAC Knives", src: "/brands/mac.svg" },
  { name: "Kai", src: "/brands/kai.svg" },
  { name: "Henckels", src: "/brands/henckels.svg" },
  { name: "Opinel", src: "/brands/opinel.svg" },
  { name: "Arcos", src: "/brands/arcos.svg" },
  { name: "Tojiro", src: "/brands/tojiro.svg" },
  { name: "Sabatier", src: "/brands/sabatier.svg" },
  { name: "WMF", src: "/brands/wmf.svg" },
  { name: "Mercer", src: "/brands/mercer.svg" },
  { name: "Messermeister", src: "/brands/messermeister.svg" },
  { name: "Chroma", src: "/brands/chroma.svg" },
  { name: "Kasumi", src: "/brands/kasumi.svg" },
  { name: "Dalstrong", src: "/brands/dalstrong.svg" },
] as const;

function BrandLogo({ name, src }: { name: string; src: string }) {
  return (
    <li className="flex h-[4.25rem] w-[11rem] shrink-0 items-center justify-center px-4 sm:h-[4.75rem] sm:w-[13rem] lg:w-[14rem]">
      <Image
        src={src}
        alt=""
        width={220}
        height={64}
        className="h-9 w-auto max-h-10 max-w-[11.5rem] object-contain sm:h-10 sm:max-h-11"
        unoptimized
      />
      <span className="sr-only">{name}</span>
    </li>
  );
}

function BrandSequence({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="brand-marquee-group flex shrink-0 items-center gap-2 sm:gap-4"
      aria-hidden={ariaHidden ? true : undefined}
    >
      {BRANDS.map((brand) => (
        <BrandLogo key={brand.name} name={brand.name} src={brand.src} />
      ))}
    </ul>
  );
}

export function KnifeBrandsMarquee({ dict }: { dict: Dictionary }) {
  return (
    <section id="brands" className="overflow-x-hidden border-t border-line bg-ivory" aria-labelledby="brands-heading">
      <div className="container-x py-14 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="brands-heading" className="display text-[1.45rem] uppercase tracking-[0.1em] sm:text-[1.75rem]">
            {dict.brands.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-stone sm:text-[16px]">{dict.brands.sub}</p>
        </div>
      </div>

      <div className="brand-marquee relative overflow-hidden pb-4 lg:pb-6">
        <div className="brand-marquee-track">
          <BrandSequence ariaHidden />
          <BrandSequence ariaHidden />
        </div>
        <ul className="sr-only">
          {BRANDS.map((brand) => (
            <li key={brand.name}>{brand.name}</li>
          ))}
        </ul>
      </div>

      <div className="container-x pb-12 lg:pb-16">
        <p className="mx-auto max-w-2xl text-center text-[12px] leading-relaxed text-stone/80">{dict.brands.disclaimer}</p>
      </div>
    </section>
  );
}
