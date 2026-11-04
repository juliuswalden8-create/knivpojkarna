import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";

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
] as const;

function BrandLogo({ name, src }: { name: string; src: string }) {
  return (
    <li className="flex h-16 w-[10.5rem] shrink-0 items-center justify-center px-3 sm:h-[4.5rem] sm:w-[12.5rem] lg:w-[13.5rem]">
      <Image
        src={src}
        alt=""
        width={180}
        height={40}
        className="h-8 w-auto max-w-full object-contain sm:h-9"
        unoptimized
      />
      <span className="sr-only">{name}</span>
    </li>
  );
}

function BrandSequence({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="brand-marquee-group flex shrink-0 items-center gap-1 sm:gap-3"
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
