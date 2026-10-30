import logo from "@/assets/nimra-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="Nimra Properties — Your Dream Home, Our Priority"
      width={324}
      height={112}
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}
