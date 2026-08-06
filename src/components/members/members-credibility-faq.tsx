import { ProductFaq } from "@/components/seo/product-faq";
import { MEMBERS_CREDIBILITY_FAQ } from "@/lib/content/offers";
import { cn } from "@/lib/utils";

type MembersCredibilityFaqProps = {
  className?: string;
};

/**
 * Credibility FAQ on /members for non-members.
 * Thin wrapper around ProductFaq so jump-nav anchors stay stable.
 */
export function MembersCredibilityFaq({ className }: MembersCredibilityFaqProps) {
  return (
    <ProductFaq
      items={MEMBERS_CREDIBILITY_FAQ}
      title="שאלות על האמינות"
      headingId="members-credibility-title"
      sectionId="members-credibility"
      className={cn("border-y border-foreground/10 bg-paper", className)}
    />
  );
}

export default MembersCredibilityFaq;
