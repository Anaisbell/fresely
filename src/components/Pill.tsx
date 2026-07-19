import type { ReactNode } from "react";

type PillVariant = "honey" | "sage";

type PillProps = {
  children: ReactNode;
  variant?: PillVariant;
};

export function Pill({ children, variant = "honey" }: PillProps) {
  const styles =
    variant === "sage"
      ? "bg-sage-tint text-sage-deep"
      : "bg-honey-tint text-honey-deep";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}
