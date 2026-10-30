import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import villa from "@/assets/hero-villa.jpg";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ValuePillars } from "@/components/public/ValuePillars";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nimra Properties — Your Dream Home, Our Priority" },
      { name: "description", content: "Nimra Properties helps buyers, tenants and property owners across Pune with verified listings and end-to-end support." },
      { property: "og:title", content: "About Nimra Properties" },
      { property: "og:description", content: "Verified listings and end-to-end property support across Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">About us</p>
          <h1 className="mt-2 text-3xl font-semibold text-primary md:text-5xl">
            Your dream home, <span className="text-gold">our priority.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Nimra Properties is a Pune-based real estate team helping people buy, rent and lease verified homes,
            offices, shops and plots. We work closely with property owners to present their listings well and with
            buyers and tenants to find a place that fits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link to="/properties">Browse Properties <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild variant="outline"><Link to="/contact">Contact Us</Link></Button>
          </div>
        </div>
        <img src={villa} alt="Modern home listed with Nimra Properties" width={1600} height={912} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card" />
      </section>
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border bg-card p-6 md:p-10">
          <h2 className="mb-6 text-center text-2xl font-semibold text-primary">How we help property owners</h2>
          <ValuePillars />
        </div>
      </section>
    </PublicLayout>
  );
}
