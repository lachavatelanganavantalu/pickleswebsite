"use client";

import { cn } from "@/lib/cn";
import { SOCIAL_LINKS } from "@/data/social-links";
import YouTubeIcon from "@/components/YouTubeIcon";
import InstagramIcon from "@/components/InstagramIcon";

const items = [
  {
    href: SOCIAL_LINKS.youtube,
    label: "Lachava on YouTube",
    Icon: YouTubeIcon,
  },
  {
    href: SOCIAL_LINKS.instagram,
    label: "Lachava on Instagram",
    Icon: InstagramIcon,
  },
] as const;

type SocialLinksProps = {
  className?: string;
  /** on-hero: compact pills beside FSSAI; on-dark: footer; on-light: about/contact */
  variant?: "on-light" | "on-dark" | "on-hero";
};

export default function SocialLinks({ className, variant = "on-light" }: SocialLinksProps) {
  return (
    <div className={cn("social-links", className)} role="list" aria-label="Social media">
      {items.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          role="listitem"
          aria-label={label}
          className={cn(
            "social-link",
            variant === "on-hero" && "social-link-on-hero",
            variant === "on-dark" && "social-link-on-dark",
            variant === "on-light" && "social-link-on-light"
          )}
        >
          <Icon className="social-link-icon" />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </div>
  );
}
