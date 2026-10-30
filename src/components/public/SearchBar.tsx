import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Home, IndianRupee, MapPin, Search, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUDGET_PRESETS, PROPERTY_TYPES } from "@/lib/constants";

function Cell({ icon: Icon, label, children }: { icon: typeof Home; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center gap-3 border-b px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-foreground">{label}</div>
        {children}
      </div>
    </div>
  );
}

const triggerCls = "h-6 border-0 bg-transparent p-0 text-sm text-muted-foreground shadow-none focus:ring-0";

export function SearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState("any");
  const [type, setType] = useState("any");
  const [budget, setBudget] = useState("0");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const b = BUDGET_PRESETS[Number(budget)];
    navigate({
      to: "/properties",
      search: {
        q: q.trim() || undefined,
        purpose: purpose === "any" ? undefined : (purpose as "sell" | "rent" | "lease"),
        type: type === "any" ? undefined : [type],
        min: b.min,
        max: b.max,
      },
    });
  }

  return (
    <form onSubmit={go} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-0 md:rounded-xl md:bg-card md:p-2 md:shadow-card">
      <div className="flex flex-1 flex-col rounded-xl bg-card shadow-card md:flex-row md:shadow-none">
        <Cell icon={MapPin} label="Location">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search locality, area..."
            maxLength={100}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Cell>
        <Cell icon={Tags} label="Buy / Rent / Lease">
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="sell">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
            </SelectContent>
          </Select>
        </Cell>
        <Cell icon={Home} label="Property Type">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Cell>
        <Cell icon={IndianRupee} label="Budget">
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUDGET_PRESETS.map((b, i) => <SelectItem key={b.label} value={String(i)}>{b.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Cell>
      </div>
      <Button type="submit" size="lg" className="h-12 px-8 md:ml-2">
        <Search className="h-5 w-5" /> Search
      </Button>
    </form>
  );
}
