import { memo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Globe } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Community member locations with animated markers
const memberLocations = [
  { name: "Bangladesh", coordinates: [90.3563, 23.685], members: 5000, color: "hsl(var(--primary))" },
  { name: "India", coordinates: [78.9629, 20.5937], members: 1200, color: "hsl(var(--primary))" },
  { name: "Pakistan", coordinates: [69.3451, 30.3753], members: 450, color: "hsl(var(--primary))" },
  { name: "Nepal", coordinates: [84.124, 28.3949], members: 320, color: "hsl(var(--accent))" },
  { name: "Sri Lanka", coordinates: [80.7718, 7.8731], members: 180, color: "hsl(var(--accent))" },
  { name: "UAE", coordinates: [53.8478, 23.4241], members: 800, color: "hsl(var(--primary))" },
  { name: "Saudi Arabia", coordinates: [45.0792, 23.8859], members: 650, color: "hsl(var(--primary))" },
  { name: "Qatar", coordinates: [51.1839, 25.3548], members: 280, color: "hsl(var(--accent))" },
  { name: "Kuwait", coordinates: [47.4818, 29.3117], members: 150, color: "hsl(var(--accent))" },
  { name: "Malaysia", coordinates: [101.9758, 4.2105], members: 420, color: "hsl(var(--primary))" },
  { name: "Singapore", coordinates: [103.8198, 1.3521], members: 180, color: "hsl(var(--accent))" },
  { name: "USA", coordinates: [-95.7129, 37.0902], members: 350, color: "hsl(var(--primary))" },
  { name: "UK", coordinates: [-3.436, 55.3781], members: 280, color: "hsl(var(--primary))" },
  { name: "Canada", coordinates: [-106.3468, 56.1304], members: 190, color: "hsl(var(--accent))" },
  { name: "Australia", coordinates: [133.7751, -25.2744], members: 120, color: "hsl(var(--accent))" },
  { name: "Germany", coordinates: [10.4515, 51.1657], members: 95, color: "hsl(var(--accent))" },
  { name: "Italy", coordinates: [12.5674, 41.8719], members: 75, color: "hsl(var(--accent))" },
  { name: "Japan", coordinates: [138.2529, 36.2048], members: 85, color: "hsl(var(--accent))" },
  { name: "South Korea", coordinates: [127.7669, 35.9078], members: 60, color: "hsl(var(--accent))" },
  { name: "Oman", coordinates: [55.9754, 21.4735], members: 120, color: "hsl(var(--accent))" },
];

const WorldMapSection = () => {
  const { t } = useLanguage();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const totalMembers = memberLocations.reduce((sum, loc) => sum + loc.members, 0);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Globe className="w-4 h-4" />
            <span>{t("Global Community", "বৈশ্বিক কমিউনিটি")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("United Across the World", "বিশ্বজুড়ে ঐক্যবদ্ধ")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Building bridges of unity from South Asia to every corner of the globe",
              "দক্ষিণ এশিয়া থেকে বিশ্বের প্রতিটি কোণে ঐক্যের সেতুবন্ধন"
            )}
          </p>
        </div>

        {/* Map Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow effect behind map */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-3xl opacity-50 rounded-3xl" />
          
          <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-4 md:p-8 shadow-xl">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
                center: [60, 25],
              }}
              className="w-full h-auto"
              style={{ maxHeight: "500px" }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "hsl(var(--muted-foreground)/0.3)", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Connection lines */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Member markers */}
              {memberLocations.map((location, index) => (
                <Marker
                  key={location.name}
                  coordinates={location.coordinates as [number, number]}
                  onMouseEnter={() => setHoveredLocation(location.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  {/* Pulse ring */}
                  <circle
                    r={Math.min(location.members / 100, 15) + 4}
                    fill="none"
                    stroke={location.color}
                    strokeWidth={1.5}
                    opacity={0.4}
                    className="animate-ping"
                    style={{ animationDuration: `${2 + index * 0.2}s` }}
                  />
                  {/* Main dot */}
                  <circle
                    r={Math.min(location.members / 150, 10) + 3}
                    fill={location.color}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    style={{
                      filter: `drop-shadow(0 0 ${location.members > 500 ? 8 : 4}px ${location.color})`,
                    }}
                  />
                  {/* Inner glow */}
                  <circle
                    r={Math.min(location.members / 300, 5) + 1}
                    fill="white"
                    opacity={0.6}
                  />
                  
                  {/* Tooltip */}
                  {hoveredLocation === location.name && (
                    <g>
                      <rect
                        x={-40}
                        y={-45}
                        width={80}
                        height={35}
                        rx={6}
                        fill="hsl(var(--popover))"
                        stroke="hsl(var(--border))"
                        strokeWidth={1}
                      />
                      <text
                        textAnchor="middle"
                        y={-30}
                        className="fill-foreground text-xs font-semibold"
                        style={{ fontSize: "10px" }}
                      >
                        {location.name}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-18}
                        className="fill-muted-foreground text-xs"
                        style={{ fontSize: "8px" }}
                      >
                        {location.members.toLocaleString()} members
                      </text>
                    </g>
                  )}
                </Marker>
              ))}
            </ComposableMap>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
                <span className="text-sm text-muted-foreground">{t("Major Hub", "প্রধান হাব")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/30" />
                <span className="text-sm text-muted-foreground">{t("Growing Community", "বর্ধনশীল কমিউনিটি")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats below map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              {memberLocations.length}+
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Countries", "দেশ")}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
              {(totalMembers / 1000).toFixed(0)}K+
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Members", "সদস্য")}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              6
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Continents", "মহাদেশ")}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-xl border border-border/50">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
              24/7
            </div>
            <div className="text-sm text-muted-foreground">
              {t("Active Community", "সক্রিয় কমিউনিটি")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(WorldMapSection);
