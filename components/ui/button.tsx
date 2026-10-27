import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "quiet" | "light";
type ButtonSize = "default" | "small";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({ variant = "primary", size = "default", className = "", children, ...props }: ButtonProps) {
  return <button className={`button button-${variant}${size === "small" ? " button-small" : ""}${className ? ` ${className}` : ""}`} {...props}>{children}</button>;
}
