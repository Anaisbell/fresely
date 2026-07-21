import type { ButtonHTMLAttributes, ReactNode } from "react";

type TileSize = "default" | "compact";

type TileProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
  /**
   * "compact" is opt-in and only lowers padding/type size — selection
   * behavior and colors are unchanged. Added for CultureTilePicker's
   * Settings usage, where the same grid needs to read as one field among
   * several rather than the primary, full-weight selection experience it
   * is during onboarding. Every existing call site defaults to "default",
   * which renders identically to before this prop existed.
   */
  size?: TileSize;
};

export function Tile({
  children,
  selected = false,
  size = "default",
  className = "",
  type = "button",
  onClick,
  ...rest
}: TileProps) {
  const base =
    "cursor-pointer rounded-xl text-center border border-transparent transition-colors";
  const sizing =
    size === "compact" ? "px-4 py-2.5 text-sm" : "px-5 py-4 text-base";
  const state = selected
    ? "bg-sage-tint border-sage text-sage-deep font-medium"
    : "bg-surface text-charcoal hover:bg-warm";
  return (
    <button
      type={type}
      aria-pressed={selected}
      onClick={onClick}
      className={`${base} ${sizing} ${state} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
