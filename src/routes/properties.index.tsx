import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon, Search, SlidersHorizontal } from "lucide-react";
import heroImg from "@/assets/hero-home.jpg";
import { PublicLayout, EmptyState } from "@/components/public/PublicLayout";
import { PropertyCard, PropertyCardSkeleton } from "@/components/public/PropertyCard";
import { LeafletMap } from "@/components/map/LeafletMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { listPublicProperties } from "@/lib/public.functions";
import { CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().max(100).optional().catch(undefined),
  purpose: z.enum(["sell", "rent", "lease"]).optional().catch(undefined),
  cat: z.array(z.enum(["residential", "commercial", "plot"])).optional().catch(undefined),
  type: z.array(z.string()).optional().catch(undefined),
  bhk: z.array(z.string()).optional().catch(undefined),
  min: z.number().optional().catch(undefined),
  max: z.number().optional().catch(undefined),
  amin: z.number().optional().catch(undefined),
  amax: z.number().optional().catch(undefined),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  view: z.enum(["grid", "map"]).optional().catch(undefined),
});
type S = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/properties/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Properties in Pune — Buy, Rent & Lease | Nimra Properties" },
      { name: "description", content: "Explore verified properties for buying, renting and investment across Pune. Filter by location, type, BHK, budget and area." },
      { property: "og:title", content: "Properties in Pune | Nimra Properties" },
      { property: "og:description", content: "Explore verified properties for buying, renting and investment across Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PropertiesPage,
});

const BHKS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const PAGE_SIZE = 12;

function toggle<T>(arr: T[] | undefined, v: T): T[] | undefined {
  const a = arr ?? [];
  const n = a.includes(v) ? a.filter((x) => x !== v) : [...a, v];
  return n.length ? n : undefined;
}

function Filters({ draft, setDraft, onApply, onClear }: { draft: S; setDraft: (s: S) => void; onApply: () => void; onClear: () => void }) {
  const num = (v: string) => (v === "" ? undefined : Math.max(0, Number(v)));
  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">Filters</h2>
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-primary">Clear All</button>
      </div>
      <section>
        <h3 className="mb-2 font-medium">Location</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search locality, area..." value={draft.q ?? ""} maxLength={100}
            onChange={(e) => setDraft({ ...draft, q: e.target.value || undefined })} />
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-medium">Buy / Rent / Lease</h3>
        <div className="grid grid-cols-3 gap-2">
          {(["sell", "rent", "lease"] as const).map((p) => (
            <button key={p} onClick={() => setDraft({ ...draft, purpose: draft.purpose === p ? undefined : p })}
              className={cn("rounded-full border py-1.5", draft.purpose === p ? "border-primary bg-primary text-primary-foreground" : "bg-secondary")}>
              {p === "sell" ? "Buy" : p === "rent" ? "Rent" : "Lease"}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-2 font-medium">Property Category</h3>
        {CATEGORIES.map((c) => (
          <label key={c.value} className="flex items-center gap-2 py-1">
            <Checkbox checked={draft.cat?.includes(c.value) ?? false} onCheckedChange={() => setDraft({ ...draft, cat: toggle(draft.cat, c.value) })} />
            {c.label}
          </label>
        ))}
      </section>
      <section>
        <h3 className="mb-2 font-medium">Property Type</h3>
        {PROPERTY_TYPES.map((t) => (
          <label key={t} className="flex items-center gap-2 py-1">
            <Checkbox checked={draft.type?.includes(t) ?? false} onCheckedChange={() => setDraft({ ...draft, type: toggle(draft.type, t) })} />
            {t}
          </label>
        ))}
      </section>
      <section>
        <h3 className="mb-2 font-medium">BHK</h3>
        {BHKS.map((b) => (
          <label key={b} className="flex items-center gap-2 py-1">
            <Checkbox checked={draft.bhk?.includes(b) ?? false} onCheckedChange={() => setDraft({ ...draft, bhk: toggle(draft.bhk, b) })} />
            {b}
          </label>
        ))}
      </section>
      <section>
        <h3 className="mb-2 font-medium">Budget (₹)</h3>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="Min" value={draft.min ?? ""} onChange={(e) => setDraft({ ...draft, min: num(e.target.value) })} />
          <span className="text-muted-foreground">to</span>
          <Input type="number" min={0} placeholder="Max" value={draft.max ?? ""} onChange={(e) => setDraft({ ...draft, max: num(e.target.value) })} />
        </div>
        {(draft.min || draft.max) && (
          <p className="mt-1 text-xs text-muted-foreground">{draft.min ? formatPrice(draft.min) : "Any"} – {draft.max ? formatPrice(draft.max) : "Any"}</p>
        )}
      </section>
      <section>
        <h3 className="mb-2 font-medium">Area (sq.ft.)</h3>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} placeholder="Min" value={draft.amin ?? ""} onChange={(e) => setDraft({ ...draft, amin: num(e.target.value) })} />
          <span className="text-muted-foreground">to</span>
          <Input type="number" min={0} placeholder="Max" value={draft.amax ?? ""} onChange={(e) => setDraft({ ...draft, amax: num(e.target.value) })} />
        </div>
      </section>
      <Button className="w-full" onClick={onApply}>Apply Filters</Button>
    </div>
  );
}

function PropertiesPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const [draft, setDraft] = useState<S>(s);
  const [sheet, setSheet] = useState(false);
  useEffect(() => setDraft(s), [s]);

  const page = s.page ?? 1;
  const view = s.view ?? "grid";
  const { data, isLoading } = useQuery({
    queryKey: ["properties", s],
    placeholderData: keepPreviousData,
    queryFn: () =>
      listPublicProperties({
        data: {
          q: s.q, purpose: s.purpose, categories: s.cat, types: s.type, bhk: s.bhk,
          minPrice: s.min, maxPrice: s.max, minArea: s.amin, maxArea: s.amax,
          sort: s.sort, page, pageSize: view === "map" ? 100 : PAGE_SIZE,
        },
      }),
  });
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const update = (patch: Partial<S>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });
  const apply = () => { navigate({ search: { ...draft, page: undefined, view: s.view, sort: s.sort } }); setSheet(false); };
  const clear = () => { navigate({ search: {} }); setSheet(false); };

  const markers = (data?.items ?? [])
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ id: p.id, lat: p.latitude!, lng: p.longitude!, label: `${formatPrice(p.price, p.purpose)} · ${p.title}`, href: `/properties/${p.slug}` }));

  return (
    <PublicLayout>
      <section className="md:px-4 md:pt-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden md:rounded-2xl">
          <img src={heroImg} alt="" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/20 max-md:from-primary-deep/85 max-md:via-primary-deep/60 max-md:to-primary-deep/30" />
          <div className="relative px-5 py-8 md:px-12 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Properties</p>
            <h1 className="mt-1 text-3xl font-semibold text-primary-foreground md:text-5xl md:text-primary">
              Properties in <span className="text-gold">Pune</span>
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/90 md:text-base md:text-muted-foreground">
              Explore verified properties for buying, renting and investment across Pune.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 lg:grid-cols-[270px_1fr]">
        <aside className="hidden h-fit rounded-xl border bg-card p-5 shadow-card lg:block">
          <Filters draft={draft} setDraft={setDraft} onApply={apply} onClear={clear} />
        </aside>
        <Sheet open={sheet} onOpenChange={setSheet}>
          <SheetContent side="left" className="w-80 overflow-y-auto bg-card">
            <SheetTitle className="sr-only">Filters</SheetTitle>
            <Filters draft={draft} setDraft={setDraft} onApply={apply} onClear={clear} />
          </SheetContent>
        </Sheet>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="mr-auto text-lg font-semibold text-primary md:text-xl">
              {total} {total === 1 ? "Property" : "Properties"} in Pune
            </h2>
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSheet(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-muted-foreground sm:inline">Sort by:</span>
              <Select value={s.sort ?? "newest"} onValueChange={(v) => update({ sort: v as S["sort"], page: undefined })}>
                <SelectTrigger className="h-9 w-40 bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex overflow-hidden rounded-md border bg-card">
              <button onClick={() => update({ view: undefined })} className={cn("flex items-center gap-1.5 px-3 py-2 text-sm", view === "grid" && "bg-primary text-primary-foreground")}>
                <LayoutGrid className="h-4 w-4" /> Grid
              </button>
              <button onClick={() => update({ view: "map", page: undefined })} className={cn("flex items-center gap-1.5 px-3 py-2 text-sm", view === "map" && "bg-primary text-primary-foreground")}>
                <MapIcon className="h-4 w-4" /> Map
              </button>
            </div>
          </div>

          {view === "map" ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border">
                <LeafletMap markers={markers} className="h-[520px] w-full" />
              </div>
              {data && markers.length < data.items.length && (
                <p className="text-xs text-muted-foreground">{data.items.length - markers.length} properties don't have a map location yet and are not shown on the map.</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading && Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
                {data?.items.map((p) => <PropertyCard key={p.id} p={p} />)}
              </div>
              {!isLoading && !data?.items.length && (
                <EmptyState title="No properties match your filters" text="Try widening your budget or clearing some filters.">
                  <Button variant="outline" onClick={clear}>Clear filters</Button>
                </EmptyState>
              )}
              {pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => update({ page: page - 1 })}><ChevronLeft className="h-4 w-4" /></Button>
                  {Array.from({ length: pages }).slice(0, 7).map((_, i) => (
                    <Button key={i} variant={page === i + 1 ? "default" : "ghost"} size="icon" onClick={() => update({ page: i + 1 })}>{i + 1}</Button>
                  ))}
                  <Button variant="ghost" size="icon" disabled={page >= pages} onClick={() => update({ page: page + 1 })}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
