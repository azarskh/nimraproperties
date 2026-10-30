import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { CONTACT, telHref, waHref } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Logo className="h-14" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Verified properties across Pune with end-to-end support for buyers, tenants and owners.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/properties" className="hover:text-primary">Properties</Link></li>
            <li><Link to="/list-property" className="hover:text-primary">List Your Property</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary">Get in touch</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={telHref(CONTACT.callPhone)} className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{CONTACT.callPhone}</a></li>
            <li><a href={waHref(CONTACT.whatsappPhone)} target="_blank" rel="noreferrer" className="flex items-center gap-2"><WhatsAppIcon className="h-4 w-4 text-whatsapp" />{CONTACT.whatsappPhone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-primary" />{CONTACT.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row md:px-6">
          <span>© {new Date().getFullYear()} Nimra Properties. All rights reserved.</span>
          <span>Your Dream Home • Our Priority</span>
        </div>
      </div>
    </footer>
  );
}
