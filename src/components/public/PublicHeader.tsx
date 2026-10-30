import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, Phone } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CONTACT, telHref, waHref } from "@/lib/constants";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/list-property", label: "List Your Property" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-[72px] md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="-ml-1 p-1 text-primary lg:hidden" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Logo className="mb-6 h-12" />
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 space-y-3 border-t pt-6 text-sm">
              <a href={telHref(CONTACT.callPhone)} className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 text-primary" /> {CONTACT.callPhone}
              </a>
              <a href={waHref(CONTACT.whatsappPhone)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-foreground">
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" /> {CONTACT.whatsappPhone}
              </a>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="shrink-0">
          <Logo className="h-10 md:h-12" />
        </Link>

        <nav className="mx-auto hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative py-6 text-sm text-foreground/80 hover:text-primary"
              activeProps={{ className: "font-semibold !text-primary after:absolute after:inset-x-0 after:bottom-4 after:h-0.5 after:bg-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <a
            href={waHref(CONTACT.whatsappPhone)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-foreground"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon className="h-6 w-6 text-whatsapp" />
            <span className="hidden xl:inline">{CONTACT.whatsappPhone}</span>
          </a>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/list-property">
              List Your Property <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" className="sm:hidden">
            <Link to="/list-property">List</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
