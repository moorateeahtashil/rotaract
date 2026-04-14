import Link from "next/link";
import Image from "next/image";

interface RotaryLogoProps {
  /**
   * Logo variant:
   - "full" - Rotary wheel + "Rotary" text + club name
   - "wheel" - Rotary wheel only (simplified)
   - "wordmark" - "Rotary" wordmark only
   - "club" - Club name only
   */
  variant?: "full" | "wheel" | "wordmark" | "club";
  /** Club or organization name */
  clubName?: string;
  /** Custom logo URL (from Supabase storage) */
  logoUrl?: string;
  /** Link href (defaults to home) */
  href?: string;
  /** Additional className */
  className?: string;
}

/**
 * Rotary Logo Component
 * 
 * Follows Rotary brand guidelines:
 * - Uses official Rotary wheel symbol
 * - Maintains proper clearspace and sizing
 * - Supports club/district custom logos
 * 
 * Brand Center: https://brandcenter.rotary.org/en-us/downloads
 */
export function RotaryLogo({ 
  variant = "full", 
  clubName,
  logoUrl,
  href = "/",
  className = ""
}: RotaryLogoProps) {
  // If custom logo URL is provided, use it
  if (logoUrl) {
    return (
      <Link href={href} className={`flex items-center gap-3 ${className}`}>
        <Image
          src={logoUrl}
          alt={clubName || "Rotaract Club Logo"}
          width={120}
          height={40}
          className="h-9 w-auto"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Rotary Wheel Symbol */}
      {(variant === "full" || variant === "wheel") && (
        <div className="relative h-9 w-9 flex-shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer circle */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="#17458f" strokeWidth="4" />
            
            {/* Inner circle */}
            <circle cx="50" cy="50" r="20" fill="none" stroke="#17458f" strokeWidth="3" />
            
            {/* Gear teeth - 24 spokes */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180;
              const x1 = 50 + 22 * Math.cos(angle);
              const y1 = 50 + 22 * Math.sin(angle);
              const x2 = 50 + 48 * Math.cos(angle);
              const y2 = 50 + 48 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#17458f"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Center dot */}
            <circle cx="50" cy="50" r="4" fill="#17458f" />
          </svg>
        </div>
      )}

      {/* Text Content */}
      <div className="flex flex-col">
        {/* "Rotary" Wordmark */}
        {(variant === "full" || variant === "wordmark") && (
          <span className="text-rotary-blue font-bold text-lg sm:text-xl leading-tight">
            Rotary
          </span>
        )}

        {/* Club Name */}
        {(variant === "full" || variant === "club") && clubName && (
          <span className="text-charcoal font-semibold text-xs sm:text-sm leading-tight">
            {clubName}
          </span>
        )}
      </div>

      {/* Fallback when no variant specified */}
      {variant !== "full" && variant !== "wheel" && variant !== "wordmark" && variant !== "club" && clubName && (
        <span className="font-semibold text-charcoal text-lg">
          {clubName}
        </span>
      )}
    </Link>
  );
}

/**
 * Simplified Rotaract Logo (for Rotaract clubs)
 * Uses Rotaract-specific branding
 */
export function RotaractLogo({ 
  clubName = "Rotaract Club",
  logoUrl,
  href = "/",
  className = ""
}: Omit<RotaryLogoProps, "variant">) {
  if (logoUrl) {
    return (
      <Link href={href} className={`flex items-center gap-3 ${className}`}>
        <Image
          src={logoUrl}
          alt={clubName}
          width={120}
          height={40}
          className="h-9 w-auto"
          priority
        />
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Rotaract Wheel (simplified) */}
      <div className="relative h-9 w-9 flex-shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="#0067c8" strokeWidth="4" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#0067c8" strokeWidth="3" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x1 = 50 + 22 * Math.cos(angle);
            const y1 = 50 + 22 * Math.sin(angle);
            const x2 = 50 + 48 * Math.cos(angle);
            const y2 = 50 + 48 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0067c8"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="50" cy="50" r="4" fill="#0067c8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="text-azure font-bold text-lg sm:text-xl leading-tight">
          Rotaract
        </span>
        <span className="text-charcoal font-semibold text-xs sm:text-sm leading-tight">
          {clubName}
        </span>
      </div>
    </Link>
  );
}

export default RotaryLogo;
