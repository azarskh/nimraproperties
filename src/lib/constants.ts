export const CONTACT = {
  callPhone: "+91 9881666837",
  whatsappPhone: "+91 9763344377",
  email: "nimra.properties09@gmail.com",
};

export const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;
export const waHref = (p: string, text?: string) =>
  `https://wa.me/${p.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "plot", label: "Plot / Land" },
] as const;

export const PURPOSES = [
  { value: "sell", label: "Sell", buyLabel: "Buy" },
  { value: "rent", label: "Rent", buyLabel: "Rent" },
  { value: "lease", label: "Lease", buyLabel: "Lease" },
] as const;

export const PROPERTY_TYPES = [
  "Apartment",
  "Independent House",
  "Villa",
  "Row House",
  "Office Space",
  "Shop",
  "Showroom",
  "Warehouse",
  "Plot",
  "Land",
];

export const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK", "Not applicable"];
export const AGE_OPTIONS = ["New / Under construction", "0-1 Years", "1-5 Years", "5-10 Years", "10+ Years", "Not sure"];
export const PARKING_OPTIONS = ["None", "1 Covered", "2 Covered", "1 Open", "2 Open", "Not sure"];
export const FACING_OPTIONS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West", "Not sure"];
export const POSSESSION_OPTIONS = ["Ready to Move", "Under Construction", "Not sure"];
export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
export const AMENITIES = [
  "Lift",
  "Power Backup",
  "Gym",
  "Children's Play Area",
  "Landscaped Garden",
  "24/7 Water Supply",
  "Security",
  "Parking",
  "Swimming Pool",
  "Clubhouse",
  "CCTV",
  "Intercom",
];

export const BUDGET_PRESETS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "Under ₹50 Lakh", min: undefined, max: 5000000 },
  { label: "₹50 Lakh – ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr – ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2 Cr", min: 20000000, max: undefined },
];
