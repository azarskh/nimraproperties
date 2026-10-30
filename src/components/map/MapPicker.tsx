import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeafletMap, geocode } from "./LeafletMap";

export function MapPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  async function search() {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const r = await geocode(q);
      if (r) onChange(r);
      else toast.error("Location not found. Try a nearby landmark.");
    } catch {
      toast.error("Map search is unavailable right now.");
    }
    setBusy(false);
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search location or drag the pin on map..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
          />
        </div>
        <Button type="button" variant="secondary" onClick={search} disabled={busy}>Find</Button>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <LeafletMap pin={value} onPinChange={onChange} className="h-64 w-full" />
        <div className="flex items-center gap-2 bg-success-soft px-3 py-2 text-xs text-foreground">
          <MapPin className="h-3.5 w-3.5 text-success" />
          {value ? `Pinned at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} — drag to adjust` : "Click on the map or drag the pin to mark the exact location"}
        </div>
      </div>
    </div>
  );
}
