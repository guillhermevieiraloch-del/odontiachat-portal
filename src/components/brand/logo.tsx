import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** When true, hides the wordmark and shows only the icon */
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { icon: 44, text: "text-base" },
  md: { icon: 52, text: "text-lg" },
  lg: { icon: 72, text: "text-2xl" },
};

export function Logo({ className, iconOnly = false, size = "md" }: LogoProps) {
  const cfg = SIZE_MAP[size];

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="OdontIAChat"
    >
      {/* Using plain <img> instead of next/image to avoid optimization quirks
          during dev that occasionally cause the asset to fail silently. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt=""
        width={cfg.icon}
        height={cfg.icon}
        className="object-contain flex-shrink-0 drop-shadow-[0_4px_10px_rgba(13,59,102,0.18)]"
        style={{
          width: cfg.icon,
          height: cfg.icon,
        }}
      />
      {!iconOnly && (
        <span
          className={cn(
            "font-display font-extrabold leading-none tracking-tight",
            cfg.text,
          )}
        >
          <span className="text-brand-primary">OdontIA</span>
          <span className="text-brand-accent-dark">Chat</span>
        </span>
      )}
    </span>
  );
}

/**
 * Logo mark only (for favicons, app icons, avatars). Same source image.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="OdontIAChat"
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  );
}
