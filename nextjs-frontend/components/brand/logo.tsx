import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "dark";
  showText?: boolean;
}

export function Logo({ 
  className, 
  size = "md", 
  variant = "default", 
  showText = true 
}: LogoProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-8 h-8", text: "text-xl" },
    lg: { icon: "w-12 h-12", text: "text-2xl" },
    xl: { icon: "w-16 h-16", text: "text-3xl" }
  };

  const variants = {
    default: {
      icon: "text-primary",
      text: "text-foreground",
      gradient: "from-primary to-secondary"
    },
    white: {
      icon: "text-white",
      text: "text-white", 
      gradient: "from-white to-white/90"
    },
    dark: {
      icon: "text-primary",
      text: "text-primary",
      gradient: "from-primary to-secondary"
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="logo">
      {/* Premium Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl",
        "bg-gradient-to-br", variants[variant].gradient,
        "shadow-lg shadow-primary/20",
        sizes[size].icon
      )}>
        {/* Construction-inspired geometric logo */}
        <svg 
          viewBox="0 0 32 32" 
          className={cn("w-full h-full p-1.5", variants[variant].icon)}
          fill="currentColor"
        >
          {/* Abstract building/construction elements */}
          <path d="M4 28h24v2H4z" opacity="0.9"/>
          <path d="M6 14h4v14H6z" opacity="0.8"/>
          <path d="M12 10h4v18h-4z" opacity="0.9"/>
          <path d="M18 6h4v22h-4z" opacity="0.8"/>
          <path d="M24 12h4v16h-4z" opacity="0.9"/>
          {/* Connection lines representing "bidding" */}
          <path d="M8 20h2M8 16h2M14 14h2M14 18h2M20 10h2M20 14h2M26 16h2M26 20h2" 
                stroke="currentColor" 
                strokeWidth="1" 
                fill="none" 
                opacity="0.6"/>
          {/* Central connecting element */}
          <circle cx="16" cy="4" r="2" opacity="0.9"/>
          <path d="M16 6v2M14 8l4 2M18 8l-4 2" 
                stroke="currentColor" 
                strokeWidth="1" 
                fill="none" 
                opacity="0.7"/>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight",
            sizes[size].text,
            variants[variant].text
          )}>
            BuildBidz
          </span>
          <span className={cn(
            "text-xs font-medium opacity-70 -mt-1",
            variants[variant].text
          )}>
            Construction Procurement
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ className, size = "md" }: Omit<LogoProps, "showText">) {
  return <Logo className={className} size={size} showText={false} />;
}