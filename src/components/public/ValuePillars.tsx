import { BarChart3, Camera, FileText, Users } from "lucide-react";

export const PILLARS = [
  { icon: Camera, title: "Professional Photo Shoot", text: "High quality visuals to showcase your property" },
  { icon: FileText, title: "End-to-End Support", text: "Assistance with documentation & verification" },
  { icon: BarChart3, title: "Wider Exposure", text: "Reach genuine buyers and tenants" },
  { icon: Users, title: "Trusted Local Experts", text: "Personalized support throughout the process" },
];

export function ValuePillars({ variant = "grid" }: { variant?: "grid" | "row" }) {
  if (variant === "row") {
    return (
      <div className="grid grid-cols-4 gap-2 md:grid-cols-4 md:gap-0 md:divide-x">
        {PILLARS.map((p) => (
          <div key={p.title} className="flex flex-col items-center gap-2 px-2 text-center md:flex-row md:items-start md:gap-4 md:px-6 md:text-left">
            <p.icon className="h-7 w-7 shrink-0 text-gold md:h-9 md:w-9" />
            <div>
              <div className="text-[11px] font-semibold text-foreground md:text-sm">{p.title}</div>
              <div className="hidden text-xs text-muted-foreground md:block">{p.text}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-0 md:divide-x">
      {PILLARS.map((p) => (
        <div key={p.title} className="flex flex-col items-center px-2 text-center md:px-4">
          <p.icon className="h-7 w-7 text-gold md:h-9 md:w-9" />
          <div className="mt-2 text-[11px] font-semibold text-foreground md:text-sm">{p.title}</div>
          <div className="mt-1 hidden text-xs text-muted-foreground md:block">{p.text}</div>
        </div>
      ))}
    </div>
  );
}
