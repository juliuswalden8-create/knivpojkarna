"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function FaqAccordion({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-line bg-soft">
      <div className="container-x py-14 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">{dict.homeFaq.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.homeFaq.title}</h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {dict.homeFaq.items.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span className="font-display text-[16px] font-semibold tracking-[-0.01em] text-ink sm:text-[17px]">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-stone transition-transform",
                      expanded && "rotate-45 text-orange",
                    )}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-[15px] leading-relaxed text-stone">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
