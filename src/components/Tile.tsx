import type { ButtonHTMLAttributes, ReactNode } from "react";

type TileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
};

export function Tile({
  children,
  selected = false,
  className = "",
  type = "button",
  onClick,
  ...rest
}: TileProps) {
  const base =
    "cursor-pointer rounded-xl px-5 py-4 text-base text-center border border-transparent transition-colors";
  const state = selected
    ? "bg-sage-tint border-sage text-sage-deep font-medium"
    : "bg-surface text-charcoal hover:bg-warm";
  return (
    <button
      type={type}
      aria-pressed={selected}
      onClick={onClick}
      className={`${base} ${state} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
