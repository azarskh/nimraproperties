import { Link } from "@tanstack/react-router";
import { BedDouble, Heart, ImageOff, MapPin, Ruler } from "lucide-react";
import type { PublicProperty } from "@/lib/public.functions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PropertyCard({ p, compact }: { p: PublicProperty; compact?: boolean }) {
  const img = p.photo_urls[0];
  return (
    <Link
      to="/properties/$slug"
      params={{ slug: p.slug }}
      className={cn(
        "group flex overflow-hidden rounded-xl border bg-card shadow-card transition hover:-translate-y-0.5",
        compact ? "flex-row" : "flex-col",
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden bg-secondary", compact ? "w-36" : "aspect-[16/10] w-full")}>
        {img ? (
          <img src={img} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {p.featured && (
          <span className="absolute left-3 top-3 rounded-md bg-gold px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="text-lg font-semibold text-primary">{formatPrice(p.price, p.purpose)}</div>
        <div className="text-sm font-medium text-foreground">
          {p.bhk && p.bhk !== "Not applicable" && p.category === "residential" ? `${p.bhk} ` : ""}
          {p.property_type}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {p.locality}{p.locality ? ", " : ""}{p.city}
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          {p.bhk && p.bhk !== "Not applicable" && (
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bhk}</span>
          )}
          {p.carpet_area ? (
            <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{Number(p.carpet_area).toLocaleString("en-IN")} sq.ft.</span>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
          <Heart className="h-4 w-4 text-destructive" /> {p.interest_count} people interested
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
