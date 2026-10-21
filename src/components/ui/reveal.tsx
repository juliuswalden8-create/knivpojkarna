"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 12,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      data-reveal=""
      initial={{ opacity: 1, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  kicker,
  title,
  intro,
  className,
}: {
  kicker: string;
  title: string;
  intro?: string;
  invert?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      <p className="kicker">{kicker}</p>
      <h2 className="display mt-3 text-[2rem] sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {intro && <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-stone sm:text-[17px]">{intro}</p>}
    </Reveal>
  );
}
