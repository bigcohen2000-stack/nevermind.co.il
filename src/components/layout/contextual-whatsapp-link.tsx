"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { getContextualWhatsAppHref } from "@/lib/whatsapp-context";
import { cn } from "@/lib/utils";

type ContextualWhatsAppLinkProps = {
  children: ReactNode;
  className?: string;
};

/** Footer / chrome link that prefills WhatsApp from the current path. */
export function ContextualWhatsAppLink({
  children,
  className,
}: ContextualWhatsAppLinkProps) {
  const pathname = usePathname() || "/";
  const href = getContextualWhatsAppHref({ pathname });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
    >
      {children}
    </a>
  );
}
