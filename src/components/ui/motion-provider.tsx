"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion reads a media query during render. On the server that value is empty,
 * and in the browser the same query matches, so the first client render
 * disagrees with the HTML. Forcing "never" keeps both renders identical.
 * Reduced motion is handled in CSS instead.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
