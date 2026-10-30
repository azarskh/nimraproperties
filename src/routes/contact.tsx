import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { LeadForm } from "@/components/public/LeadForms";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { CONTACT, telHref, waHref } from "@/lib/constants";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Nimra Properties — Call, WhatsApp or Email" },
      { name: "description", content: "Call +91 9881666837, WhatsApp +91 9763344377 or email nimra.properties09@gmail.com to speak with Nimra Properties." },
      { property: "og:title", content: "Contact Nimra Properties" },
      { property: "og:description", content: "Reach Nimra Properties by phone, WhatsApp or email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function ContactRow({ icon, label, value, href, external }: { icon: React.ReactNode; label: string; value: string; href: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block break-all text-sm text-muted-foreground">{value}</span>
      </span>
    </a>
  );
}

function Contact() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold text-primary md:text-5xl">We're here to help</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Questions about a property or listing your own? Reach out and our team will get back to you.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <ContactRow icon={<Phone className="h-5 w-5 text-primary" />} label="Call us" value={CONTACT.callPhone} href={telHref(CONTACT.callPhone)} />
            <ContactRow icon={<WhatsAppIcon className="h-5 w-5 text-whatsapp" />} label="WhatsApp" value={CONTACT.whatsappPhone} href={waHref(CONTACT.whatsappPhone)} external />
            <ContactRow icon={<Mail className="h-5 w-5 text-primary" />} label="Email us" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-section-title">Send us a message</h2>
            <p className="mb-4 text-xs text-muted-foreground">We usually respond by phone or WhatsApp.</p>
            <LeadForm kind="enquiry" submitLabel="Send Message" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
