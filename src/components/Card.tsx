import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-2xl overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
