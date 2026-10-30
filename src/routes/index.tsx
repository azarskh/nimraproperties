import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Phone } from "lucide-react";
import heroImg from "@/assets/hero-home.jpg";
import { PublicLayout, EmptyState } from "@/components/public/PublicLayout";
import { SearchBar } from "@/components/public/SearchBar";
import { ValuePillars } from "@/components/public/ValuePillars";
import { PropertyCard, PropertyCardSkeleton } from "@/components/public/PropertyCard";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { listPublicProperties, type PropertyFilters } from "@/lib/public.functions";
import { CONTACT, telHref, waHref } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nimra Properties — Find a property that feels right in Pune" },
      { name: "description", content: "Buy, rent or invest in verified properties across Pune with end-to-end support from Nimra Properties." },
      { property: "og:title", content: "Nimra Properties — Find a property that feels right" },
      { property: "og:description", content: "Verified properties across Pune to buy, rent or lease." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS: { label: string; f: PropertyFilters }[] = [
  { label: "All", f: {} },
  { label: "Buy", f: { purpose: "sell" } },
  { label: "Rent", f: { purpose: "rent" } },
  { label: "Residential", f: { categories: ["residential"] } },
  { label: "Commercial", f: { categories: ["commercial"] } },
  { label: "Plots & Land", f: { categories: ["plot"] } },
];

function Index() {
  const [tab, setTab] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["home-properties", tab],
    queryFn: () => listPublicProperties({ data: { ...TABS[tab]?.f, pageSize: 8, featuredFirst: true } }),
  });

  return (
    <PublicLayout>
      <section className="md:px-4 md:pt-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden md:rounded-2xl">
          <img src={heroImg} alt="" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/85 via-primary-deep/50 to-transparent" />
          <div className="relative px-5 pb-6 pt-10 md:px-14 md:pb-12 md:pt-16">
            <h1 className="max-w-xl text-4xl font-semibold leading-tight text-primary-foreground md:text-6xl">
              Find a property that <span className="text-gold">feels right.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-primary-foreground/90 md:text-lg">
              Buy, rent or invest in verified properties across Pune with end-to-end support from Nimra Properties.
            </p>
            <div className="mt-8 md:mt-12">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 md:mt-8">
        <div className="grid items-center gap-6 rounded-2xl border bg-gold-soft/50 p-5 md:grid-cols-[1fr_1.4fr] md:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-primary md:text-3xl">
              Want to <span className="text-gold">list your property?</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Get professional support and wider exposure for your property through Nimra Properties.
            </p>
            <Button asChild className="mt-4">
              <Link to="/list-property">List Your Property <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <ValuePillars />
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-primary md:text-3xl">Properties in Pune</h2>
          <Link to="/properties" className="flex items-center gap-1 text-sm font-medium text-primary">
            View All <span className="hidden sm:inline">Properties</span> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTab(i)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-1.5 text-sm",
                i === tab ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          {data?.items.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
        {!isLoading && !data?.items.length && (
          <EmptyState title="New listings coming soon" text="We're adding verified properties. Call or WhatsApp us and we'll share options that match your needs.">
            <div className="flex justify-center gap-2">
              <Button asChild variant="outline"><a href={telHref(CONTACT.callPhone)}><Phone className="h-4 w-4" /> Call us</a></Button>
              <Button asChild variant="outline"><a href={waHref(CONTACT.whatsappPhone)} target="_blank" rel="noreferrer"><WhatsAppIcon className="h-4 w-4 text-whatsapp" /> WhatsApp</a></Button>
            </div>
          </EmptyState>
        )}
      </section>
    </PublicLayout>
  );
}
