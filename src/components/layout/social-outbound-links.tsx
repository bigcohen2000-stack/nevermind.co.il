import type { LucideIcon } from "lucide-react";
import { Globe, Music2, Share2, Video } from "lucide-react";

import { getSocialChannels, type SocialChannel } from "@/lib/social";

type SocialOutboundLinksProps = {
  /** Extra class on the nav wrapper. */
  className?: string;
  /** Optional heading above the links. */
  label?: string;
};

const SOCIAL_ICONS: Record<SocialChannel["id"], LucideIcon> = {
  youtube: Video,
  instagram: Share2,
  tiktok: Music2,
  facebook: Globe,
  spotify: Music2,
};

/**
 * Plain outbound profile links. No embeds, no widgets, no client JS.
 */
export function SocialOutboundLinks({
  className,
  label = "ברשתות",
}: SocialOutboundLinksProps) {
  const channels = getSocialChannels();

  return (
    <nav aria-label={label} className={className}>
      <p className="text-xs font-medium tracking-wide text-muted">{label}</p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {channels.map((channel) => {
          const Icon = SOCIAL_ICONS[channel.id];
          return (
            <li key={channel.id}>
              <a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
                aria-label={`${channel.label} (נפתח בחלון חדש)`}
              >
                <Icon
                  className="size-3.5 shrink-0 text-action/80"
                  aria-hidden
                  strokeWidth={1.75}
                />
                {channel.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
