import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const PUBLIC_COLS =
  "id, ref_code, slug, title, category, purpose, property_type, bhk, project_name, description, city, locality, address, latitude, longitude, carpet_area, builtup_area, total_floors, floor_number, property_age, parking, facing, possession_status, furnishing, price, price_negotiable, maintenance, deposit, amenities, landmarks, photos, video_url, featured, interest_count, published_at, created_at";

export type PublicProperty = {
  id: string;
  ref_code: string | null;
  slug: string;
  title: string;
  category: string;
  purpose: string;
  property_type: string;
  bhk: string | null;
  project_name: string | null;
  description: string | null;
  city: string;
  locality: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  carpet_area: number | null;
  builtup_area: number | null;
  total_floors: number | null;
  floor_number: number | null;
  property_age: string | null;
  parking: string | null;
  facing: string | null;
  possession_status: string | null;
  furnishing: string | null;
  price: number;
  price_negotiable: boolean;
  maintenance: number | null;
  deposit: number | null;
  amenities: string[];
  landmarks: { name: string; distance: string }[];
  photos: string[];
  photo_urls: string[];
  video_url: string | null;
  featured: boolean;
  interest_count: number;
  published_at: string | null;
  created_at: string;
};

async function withSignedPhotos(
  sb: ReturnType<typeof publicClient>,
  rows: Record<string, unknown>[],
  firstOnly = false,
): Promise<PublicProperty[]> {
  const paths = Array.from(
    new Set(rows.flatMap((r) => ((r.photos as string[]) ?? []).slice(0, firstOnly ? 1 : undefined))),
  );
  const map = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from("property-photos").createSignedUrls(paths, 60 * 60 * 6);
    data?.forEach((d) => d.path && d.signedUrl && map.set(d.path, d.signedUrl));
  }
  return rows.map((r) => ({
    ...(r as unknown as PublicProperty),
    landmarks: Array.isArray(r.landmarks) ? (r.landmarks as PublicProperty["landmarks"]) : [],
    photo_urls: ((r.photos as string[]) ?? []).map((p) => map.get(p)).filter(Boolean) as string[],
  }));
}

const filterSchema = z.object({
  q: z.string().max(100).optional(),
  purpose: z.enum(["sell", "rent", "lease"]).optional(),
  categories: z.array(z.enum(["residential", "commercial", "plot"])).max(3).optional(),
  types: z.array(z.string().max(40)).max(20).optional(),
  bhk: z.array(z.string().max(20)).max(10).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
  page: z.number().int().min(1).max(500).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  featuredFirst: z.boolean().optional(),
});
export type PropertyFilters = z.infer<typeof filterSchema>;

export const listPublicProperties = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data: f }) => {
    const sb = publicClient();
    const page = f.page ?? 1;
    const size = f.pageSize ?? 12;
    let q = sb.from("properties").select(PUBLIC_COLS, { count: "exact" }).eq("status", "published");
    if (f.q) {
      const s = f.q.replace(/[%,()]/g, " ").trim();
      if (s) q = q.or(`locality.ilike.%${s}%,city.ilike.%${s}%,title.ilike.%${s}%,project_name.ilike.%${s}%`);
    }
    if (f.purpose) q = q.eq("purpose", f.purpose);
    if (f.categories?.length) q = q.in("category", f.categories);
    if (f.types?.length) q = q.in("property_type", f.types);
    if (f.bhk?.length) q = q.in("bhk", f.bhk);
    if (f.minPrice != null) q = q.gte("price", f.minPrice);
    if (f.maxPrice != null) q = q.lte("price", f.maxPrice);
    if (f.minArea != null) q = q.gte("carpet_area", f.minArea);
    if (f.maxArea != null) q = q.lte("carpet_area", f.maxArea);
    if (f.featuredFirst) q = q.order("featured", { ascending: false });
    switch (f.sort) {
      case "price_asc":
        q = q.order("price", { ascending: true });
        break;
      case "price_desc":
        q = q.order("price", { ascending: false });
        break;
      case "popular":
        q = q.order("interest_count", { ascending: false });
        break;
      default:
        q = q.order("published_at", { ascending: false, nullsFirst: false });
    }
    q = q.range((page - 1) * size, page * size - 1);
    const { data, count, error } = await q;
    if (error) {
      console.error(error);
      return { items: [] as PublicProperty[], total: 0, error: "Could not load properties" };
    }
    const items = await withSignedPhotos(sb, (data ?? []) as Record<string, unknown>[], true);
    return { items, total: count ?? 0, error: null as string | null };
  });

export const getPublicProperty = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await sb
      .from("properties")
      .select(PUBLIC_COLS)
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!row) return { property: null, similar: [] as PublicProperty[] };
    const [property] = await withSignedPhotos(sb, [row as Record<string, unknown>]);
    const { data: sim } = await sb
      .from("properties")
      .select(PUBLIC_COLS)
      .eq("status", "published")
      .eq("category", property.category)
      .neq("id", property.id)
      .limit(4);
    const similar = await withSignedPhotos(sb, (sim ?? []) as Record<string, unknown>[], true);
    return { property, similar };
  });
