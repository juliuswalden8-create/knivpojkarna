"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import { ParcelIllustration, SharpenIllustration, VanIllustration } from "./timeline-illustrations";

const illustrations = [VanIllustration, SharpenIllustration, ParcelIllustration] as const;

export function HowTimeline({ dict }: { dict: Dictionary }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.75", "end 0.55"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28, mass: 0.35 });
  const pathLength = useTransform(smooth, [0, 1], reduceMotion ? [1, 1] : [0, 1]);

  return (
    <div ref={trackRef} className="relative mx-auto max-w-5xl">
      <svg
        className="pointer-events-none absolute inset-x-0 top-8 hidden h-[calc(100%-4rem)] w-full text-ink lg:block"
        viewBox="0 0 1000 1200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M180 40C320 120 420 160 520 220C650 300 720 360 780 460C840 560 780 640 640 720C500 800 360 860 280 960C220 1035 260 1100 360 1160"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{ pathLength }}
          strokeDasharray="1"
          pathLength={1}
        />
      </svg>

      <svg
        className="pointer-events-none absolute left-8 top-6 h-[calc(100%-3rem)] w-12 text-ink sm:left-10 lg:hidden"
        viewBox="0 0 40 1200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M20 20V1180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{ pathLength }}
          strokeDasharray="1"
          pathLength={1}
        />
      </svg>

      <ol className="relative space-y-24 py-6 lg:space-y-36 lg:py-10">
        {dict.howPage.steps.map((step, index) => {
          const Illustration = illustrations[index] ?? VanIllustration;
          const reverse = index % 2 === 1;
          return (
            <motion.li
              key={step.num}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              <div className={reverse ? "lg:order-2" : undefined}>
                <p className="font-display text-[4.5rem] font-semibold leading-none tracking-[-0.05em] text-ink/15 sm:text-[6rem]">
                  {step.num}
                </p>
                <h2 className="mt-4 font-display text-[1.85rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.35rem]">
                  {step.title}
                </h2>
                <p className="mt-4 max-w-md text-[16px] leading-relaxed text-stone sm:text-[17px]">{step.text}</p>
              </div>
              <div className={reverse ? "lg:order-1" : undefined}>
                <motion.div
                  className="text-ink"
                  animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                  transition={reduceMotion ? undefined : { duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Illustration className="mx-auto h-auto w-full max-w-sm" />
                </motion.div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
