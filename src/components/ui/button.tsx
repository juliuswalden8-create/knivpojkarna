import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-orange text-soft hover:bg-orange-600",
  secondary: "border border-line bg-soft text-ink hover:border-ink/40",
  ghost: "text-ink hover:text-orange",
  dark: "bg-ink text-soft hover:bg-charcoal-800",
  light: "bg-soft text-ink hover:bg-ivory",
};

const sizes = {
  sm: "h-10 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
};

type Common = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium tracking-[0.01em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: Common & { href: string }) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
