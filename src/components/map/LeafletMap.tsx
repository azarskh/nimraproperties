import { useEffect, useRef } from "react";
import type * as L from "leaflet";

export const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

export type MapMarker = { id: string; lat: number; lng: number; label: string; href?: string };

/** Browser-only map. Leaflet is imported dynamically after mount so SSR never touches it. */
export function LeafletMap({
  markers = [],
  pin,
  onPinChange,
  className,
  zoom = 12,
}: {
  markers?: MapMarker[];
  pin?: { lat: number; lng: number } | null;
  onPinChange?: (p: { lat: number; lng: number }) => void;
  className?: string;
  zoom?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pinRef = useRef<L.Marker | null>(null);
  const libRef = useRef<typeof L | null>(null);
  const cbRef = useRef(onPinChange);
  cbRef.current = onPinChange;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lib = (await import("leaflet")).default;
      if (cancelled || !el.current || mapRef.current) return;
      libRef.current = lib;
      const center = pin ? [pin.lat, pin.lng] : PUNE_CENTER;
      const map = lib.map(el.current).setView(center as [number, number], zoom);
      lib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = lib.layerGroup().addTo(map);
      mapRef.current = map;
      if (cbRef.current) {
        map.on("click", (e: L.LeafletMouseEvent) => cbRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
      }
      sync();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function icon(lib: typeof L) {
    return lib.divIcon({
      className: "",
      html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--destructive);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });
  }

  function sync() {
    const lib = libRef.current;
    const map = mapRef.current;
    if (!lib || !map || !layerRef.current) return;
    layerRef.current.clearLayers();
    const pts: [number, number][] = [];
    markers.forEach((m) => {
      const mk = lib.marker([m.lat, m.lng], { icon: icon(lib) }).addTo(layerRef.current!);
      mk.bindPopup(m.href ? `<a href="${m.href}" style="font-weight:600">${escapeHtml(m.label)}</a>` : escapeHtml(m.label));
      pts.push([m.lat, m.lng]);
    });
    if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30] });
    else if (pts[0]) map.setView(pts[0], 14);

    if (onPinChange !== undefined || pin) {
      if (pin) {
        if (!pinRef.current) {
          pinRef.current = lib.marker([pin.lat, pin.lng], { icon: icon(lib), draggable: !!cbRef.current }).addTo(map);
          pinRef.current.on("dragend", () => {
            const ll = pinRef.current!.getLatLng();
            cbRef.current?.({ lat: ll.lat, lng: ll.lng });
          });
        } else pinRef.current.setLatLng([pin.lat, pin.lng]);
      }
    }
  }

  useEffect(() => {
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, pin?.lat, pin?.lng]);

  return <div ref={el} className={className ?? "h-72 w-full rounded-lg"} style={{ zIndex: 0 }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Search an address with OpenStreetMap's geocoder. */
export async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q + ", Pune")}`,
  );
  const j = (await r.json()) as { lat: string; lon: string }[];
  return j[0] ? { lat: Number(j[0].lat), lng: Number(j[0].lon) } : null;
}
