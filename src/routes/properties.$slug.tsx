import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  BedDouble, Building2, CalendarCheck, Check, ChevronLeft, ChevronRight, Heart, ImageOff, MapPin, MessageSquare, Navigation, Ruler, Share2,
} from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { PropertyCard } from "@/components/public/PropertyCard";
import { LeadForm, EnquiryDialog, VisitDialog } from "@/components/public/LeadForms";
import { LeafletMap } from "@/components/map/LeafletMap";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getPublicProperty } from "@/lib/public.functions";
import { formatINR, formatPrice, purposeLabel } from "@/lib/format";

export const Route = createFileRoute("/properties/$slug")({
  loader: async ({ params }) => {
    const res = await getPublicProperty({ data: { slug: params.slug } });
    if (!res.property) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.property;
    if (!p) return { meta: [{ title: "Property unavailable | Nimra Properties" }, { name: "robots", content: "noindex" }] };
    const title = `${p.title} — ${formatPrice(p.price, p.purpose)} | Nimra Properties`;
    const desc = (p.description ?? `${p.property_type} in ${p.locality}, ${p.city}`).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-primary">Property not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">This listing may have been sold, rented or removed.</p>
        <Button asChild className="mt-6"><Link to="/properties">Browse properties</Link></Button>
      </div>
    </PublicLayout>
  ),
  component: PropertyDetail,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v || "—"}</span>
    </div>
  );
}

function PropertyDetail() {
  const { property: p, similar } = Route.useLoaderData();
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const photos = p!.photo_urls;
  const n = photos.length;
  const prop = p!;

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: prop.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* cancelled */
    }
  }

  const specs: [string, React.ReactNode][] = [
    ["Property Type", prop.property_type],
    ["Listing Type", purposeLabel(prop.purpose)],
    ["Configuration", prop.bhk],
    ["Project / Society", prop.project_name],
    ["Carpet Area", prop.carpet_area ? `${prop.carpet_area} sq.ft.` : null],
    ["Built-up Area", prop.builtup_area ? `${prop.builtup_area} sq.ft.` : null],
    ["Floor", prop.floor_number != null ? `${prop.floor_number}` : null],
    ["Total Floors", prop.total_floors],
    ["Facing", prop.facing],
    ["Parking", prop.parking],
    ["Age of Property", prop.property_age],
    ["Status", prop.possession_status],
    ["Furnishing", prop.furnishing],
    ...(prop.maintenance ? [["Maintenance", `${formatINR(prop.maintenance)}/month`] as [string, string]] : []),
    ...(prop.deposit ? [["Deposit", formatINR(prop.deposit)] as [string, string]] : []),
  ];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link><ChevronRight className="h-3 w-3" />
          <Link to="/properties" className="hover:text-primary">Properties</Link><ChevronRight className="h-3 w-3" />
          <span className="truncate text-foreground">{prop.title}</span>
        </nav>

        {/* Gallery */}
        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-secondary">
            {n ? (
              <img src={photos[idx]} alt={`${prop.title} photo ${idx + 1}`} className="h-full w-full cursor-zoom-in object-cover" onClick={() => setLightbox(true)} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff className="h-10 w-10" /></div>
            )}
            {prop.featured && <span className="absolute left-4 top-4 rounded-md bg-gold px-2.5 py-1 text-xs font-medium text-primary-foreground">Featured</span>}
            {n > 1 && (
              <>
                <button aria-label="Previous photo" onClick={() => setIdx((idx - 1 + n) % n)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow"><ChevronLeft className="h-5 w-5" /></button>
                <button aria-label="Next photo" onClick={() => setIdx((idx + 1) % n)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 shadow"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
            {n > 0 && <span className="absolute bottom-3 right-3 rounded-md bg-foreground/70 px-2 py-0.5 text-xs text-background">{idx + 1} / {n}</span>}
          </div>
          {n > 1 && (
            <div className="grid grid-cols-5 gap-2 md:grid-cols-2">
              {photos.slice(1, 5).map((src, i) => {
                const real = i + 1;
                const isLast = i === 3 && n > 5;
                return (
                  <button key={src} onClick={() => (isLast ? setLightbox(true) : setIdx(real))} className="relative aspect-square overflow-hidden rounded-lg md:aspect-auto">
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {isLast && <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-sm font-medium text-background">+{n - 5} Photos</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start gap-4">
              <div className="mr-auto">
                <h1 className="text-2xl font-semibold text-primary md:text-3xl">{prop.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{prop.locality}, {prop.city}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-lg font-semibold"><Heart className="h-5 w-5 text-destructive" />{prop.interest_count}</div>
                <div className="text-xs text-muted-foreground">people interested</div>
              </div>
              <Button variant="outline" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
            </div>
            <div className="mt-3 text-3xl font-bold text-primary">
              {formatPrice(prop.price, prop.purpose)}
              {prop.price_negotiable && <span className="ml-2 text-sm font-normal text-muted-foreground">Negotiable</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
              {prop.bhk && prop.bhk !== "Not applicable" && <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-muted-foreground" />{prop.bhk}</span>}
              {prop.carpet_area && <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4 text-muted-foreground" />{prop.carpet_area} sq.ft.</span>}
              <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-muted-foreground" />{prop.property_type}</span>
              {prop.possession_status && <span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4 text-muted-foreground" />{prop.possession_status}</span>}
            </div>

            {/* Mobile CTA */}
            <div className="mt-5 space-y-2 lg:hidden">
              <Button className="w-full" onClick={() => document.getElementById("interest-card")?.scrollIntoView({ behavior: "smooth" })}>I'm Interested</Button>
              <div className="grid grid-cols-2 gap-2">
                <EnquiryDialog propertyId={prop.id} trigger={<Button variant="outline"><MessageSquare className="h-4 w-4" /> Ask an Enquiry</Button>} />
                <VisitDialog propertyId={prop.id} trigger={<Button variant="outline"><CalendarCheck className="h-4 w-4" /> Schedule a Visit</Button>} />
              </div>
            </div>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0">
                {["overview", "amenities", "location", "similar"].map((t) => (
                  <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent px-3 py-2 capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    {t === "similar" ? "Similar Properties" : t}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="overview" className="mt-5 space-y-6">
                <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
                  <div className="rounded-xl border bg-card p-4">
                    <h2 className="mb-2 text-section-title">Property Details</h2>
                    {specs.filter(([, v]) => v != null && v !== "").map(([k, v]) => <Row key={k} k={k} v={v} />)}
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <h2 className="mb-3 text-section-title">Key Features</h2>
                    {prop.amenities.length ? (
                      <ul className="grid grid-cols-2 gap-3 text-sm">
                        {prop.amenities.map((a) => <li key={a} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{a}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">Ask us for details about features.</p>}
                  </div>
                </div>
                {prop.description && (
                  <div>
                    <h2 className="mb-2 text-section-title">Description</h2>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{prop.description}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="amenities" className="mt-5">
                <ul className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {prop.amenities.map((a) => <li key={a} className="flex items-center gap-2 rounded-lg border bg-card p-3"><Check className="h-4 w-4 text-success" />{a}</li>)}
                </ul>
                {!prop.amenities.length && <p className="text-sm text-muted-foreground">No amenities listed.</p>}
              </TabsContent>
              <TabsContent value="location" className="mt-5 space-y-3">
                <p className="text-sm">{prop.address ? `${prop.address}, ` : ""}{prop.locality}, {prop.city}</p>
                {prop.latitude != null && prop.longitude != null ? (
                  <div className="overflow-hidden rounded-xl border">
                    <LeafletMap markers={[{ id: prop.id, lat: prop.latitude, lng: prop.longitude, label: prop.title }]} className="h-80 w-full" />
                  </div>
                ) : <p className="text-sm text-muted-foreground">Exact map location will be shared on request.</p>}
              </TabsContent>
              <TabsContent value="similar" className="mt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {similar.map((s) => <PropertyCard key={s.id} p={s} />)}
                </div>
                {!similar.length && <p className="text-sm text-muted-foreground">No similar properties right now.</p>}
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-4">
            <div id="interest-card" className="rounded-xl border bg-card p-5 shadow-card">
              <h2 className="text-section-title">I'm Interested</h2>
              <p className="mb-4 text-xs text-muted-foreground">Share your details and we'll get back to you shortly.</p>
              <LeadForm kind="interest" propertyId={prop.id} defaultMessage={`I am interested in ${prop.title}`} />
              <div className="mt-3 hidden grid-cols-2 gap-2 lg:grid">
                <EnquiryDialog propertyId={prop.id} />
                <VisitDialog propertyId={prop.id} />
              </div>
            </div>
            {prop.landmarks.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <h2 className="mb-3 text-section-title">Nearby Landmarks</h2>
                <ul className="space-y-2 text-sm">
                  {prop.landmarks.map((l) => (
                    <li key={l.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2"><Navigation className="h-3.5 w-3.5 text-muted-foreground" />{l.name}</span>
                      <span className="text-muted-foreground">{l.distance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-5xl p-2">
          <DialogTitle className="sr-only">Photos</DialogTitle>
          {n > 0 && (
            <div className="relative">
              <img src={photos[idx]} alt="" className="max-h-[80vh] w-full rounded object-contain" />
              <button onClick={() => setIdx((idx - 1 + n) % n)} className="absolute left-2 top-1/2 rounded-full bg-card/90 p-2"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => setIdx((idx + 1) % n)} className="absolute right-2 top-1/2 rounded-full bg-card/90 p-2"><ChevronRight className="h-5 w-5" /></button>
              <span className="absolute bottom-2 right-2 rounded bg-foreground/70 px-2 text-xs text-background">{idx + 1} / {n}</span>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((src, i) => (
              <button key={src} onClick={() => setIdx(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 ${i === idx ? "border-primary" : "border-transparent"}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
