import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] focus-visible:ring-blue-500",
  secondary:
    "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 active:scale-[0.98] focus-visible:ring-blue-500",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  danger:
    "bg-red-600 text-white shadow-md hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-500",
  success:
    "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] focus-visible:ring-emerald-500",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  href: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  href,
  children,
  target,
  rel,
  download,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} target={target} rel={rel} download={download}>
      {children}
    </a>
  );
}
