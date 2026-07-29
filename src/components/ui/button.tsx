import type { ButtonHTMLAttributes } from "react";

/**
 * Button — minimal action button.
 *
 * Composes the shared `.btn` system from globals.css so a real <button> matches
 * the link-styled CTAs used across the site exactly (modest radius, soft focus
 * ring, restrained motion). Three contexts: solid red "primary", quiet bordered
 * "secondary" (light), and "onDark" for dark bands. Keep button text precise
 * and dry (no hype).
 */

type Variant = "primary" | "secondary" | "onDark";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  onDark: "btn-on-dark",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}

export default Button;
