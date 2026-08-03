import { getSocialChannels } from "@/lib/social";

type SocialOutboundLinksProps = {
  /** Extra class on the nav wrapper. */
  className?: string;
  /** Optional heading above the links. */
  label?: string;
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
        {channels.map((channel) => (
          <li key={channel.id}>
            <a
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-foreground/80 no-underline transition-colors duration-200 hover:text-foreground hover:no-underline"
            >
              {channel.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
