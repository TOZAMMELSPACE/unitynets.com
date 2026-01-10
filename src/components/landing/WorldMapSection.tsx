import { memo, useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Community member locations with animated markers
const memberLocations = [
  { name: "Bangladesh", coordinates: [90.3563, 23.685], members: 5000, color: "hsl(var(--primary))", isHub: true },
  { name: "India", coordinates: [78.9629, 20.5937], members: 1200, color: "hsl(var(--primary))", isHub: false },
  { name: "Pakistan", coordinates: [69.3451, 30.3753], members: 450, color: "hsl(var(--primary))", isHub: false },
  { name: "Nepal", coordinates: [84.124, 28.3949], members: 320, color: "hsl(var(--accent))", isHub: false },
  { name: "Sri Lanka", coordinates: [80.7718, 7.8731], members: 180, color: "hsl(var(--accent))", isHub: false },
  { name: "UAE", coordinates: [53.8478, 23.4241], members: 800, color: "hsl(var(--primary))", isHub: true },
  { name: "Saudi Arabia", coordinates: [45.0792, 23.8859], members: 650, color: "hsl(var(--primary))", isHub: false },
  { name: "Qatar", coordinates: [51.1839, 25.3548], members: 280, color: "hsl(var(--accent))", isHub: false },
  { name: "Kuwait", coordinates: [47.4818, 29.3117], members: 150, color: "hsl(var(--accent))", isHub: false },
  { name: "Malaysia", coordinates: [101.9758, 4.2105], members: 420, color: "hsl(var(--primary))", isHub: false },
  { name: "Singapore", coordinates: [103.8198, 1.3521], members: 180, color: "hsl(var(--accent))", isHub: false },
  { name: "USA", coordinates: [-95.7129, 37.0902], members: 350, color: "hsl(var(--primary))", isHub: true },
  { name: "UK", coordinates: [-3.436, 55.3781], members: 280, color: "hsl(var(--primary))", isHub: true },
  { name: "Canada", coordinates: [-106.3468, 56.1304], members: 190, color: "hsl(var(--accent))", isHub: false },
  { name: "Australia", coordinates: [133.7751, -25.2744], members: 120, color: "hsl(var(--accent))", isHub: false },
  { name: "Germany", coordinates: [10.4515, 51.1657], members: 95, color: "hsl(var(--accent))", isHub: false },
  { name: "Italy", coordinates: [12.5674, 41.8719], members: 75, color: "hsl(var(--accent))", isHub: false },
  { name: "Japan", coordinates: [138.2529, 36.2048], members: 85, color: "hsl(var(--accent))", isHub: false },
  { name: "South Korea", coordinates: [127.7669, 35.9078], members: 60, color: "hsl(var(--accent))", isHub: false },
  { name: "Oman", coordinates: [55.9754, 21.4735], members: 120, color: "hsl(var(--accent))", isHub: false },
];

// Connection lines from Bangladesh hub to other countries
const connectionLines: Array<{
  from: [number, number];
  to: [number, number];
  strength: "strong" | "medium" | "light";
}> = [
  // From Bangladesh to major hubs
  { from: [90.3563, 23.685], to: [53.8478, 23.4241], strength: "strong" }, // BD -> UAE
  { from: [90.3563, 23.685], to: [-3.436, 55.3781], strength: "strong" }, // BD -> UK
  { from: [90.3563, 23.685], to: [-95.7129, 37.0902], strength: "strong" }, // BD -> USA
  { from: [90.3563, 23.685], to: [78.9629, 20.5937], strength: "strong" }, // BD -> India
  
  // From Bangladesh to South Asia
  { from: [90.3563, 23.685], to: [84.124, 28.3949], strength: "medium" }, // BD -> Nepal
  { from: [90.3563, 23.685], to: [80.7718, 7.8731], strength: "medium" }, // BD -> Sri Lanka
  { from: [90.3563, 23.685], to: [69.3451, 30.3753], strength: "medium" }, // BD -> Pakistan
  
  // From Bangladesh to Middle East
  { from: [90.3563, 23.685], to: [45.0792, 23.8859], strength: "medium" }, // BD -> Saudi
  { from: [90.3563, 23.685], to: [51.1839, 25.3548], strength: "light" }, // BD -> Qatar
  { from: [90.3563, 23.685], to: [47.4818, 29.3117], strength: "light" }, // BD -> Kuwait
  { from: [90.3563, 23.685], to: [55.9754, 21.4735], strength: "light" }, // BD -> Oman
  
  // From Bangladesh to Southeast Asia
  { from: [90.3563, 23.685], to: [101.9758, 4.2105], strength: "medium" }, // BD -> Malaysia
  { from: [90.3563, 23.685], to: [103.8198, 1.3521], strength: "light" }, // BD -> Singapore
  
  // From Bangladesh to East Asia
  { from: [90.3563, 23.685], to: [138.2529, 36.2048], strength: "light" }, // BD -> Japan
  { from: [90.3563, 23.685], to: [127.7669, 35.9078], strength: "light" }, // BD -> S. Korea
  
  // From Bangladesh to Europe
  { from: [90.3563, 23.685], to: [10.4515, 51.1657], strength: "light" }, // BD -> Germany
  { from: [90.3563, 23.685], to: [12.5674, 41.8719], strength: "light" }, // BD -> Italy
  
  // From Bangladesh to Americas & Oceania
  { from: [90.3563, 23.685], to: [-106.3468, 56.1304], strength: "light" }, // BD -> Canada
  { from: [90.3563, 23.685], to: [133.7751, -25.2744], strength: "light" }, // BD -> Australia
  
  // Inter-hub connections
  { from: [53.8478, 23.4241], to: [-3.436, 55.3781], strength: "medium" }, // UAE -> UK
  { from: [-3.436, 55.3781], to: [-95.7129, 37.0902], strength: "medium" }, // UK -> USA
  { from: [78.9629, 20.5937], to: [53.8478, 23.4241], strength: "medium" }, // India -> UAE
];

const WorldMapSection = () => {
  const { t } = useLanguage();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const totalMembers = memberLocations.reduce((sum, loc) => sum + loc.members, 0);

  const lineStyles = useMemo(() => ({
    strong: { strokeWidth: 1.5, opacity: 0.6, dashArray: "none" },
    medium: { strokeWidth: 1, opacity: 0.4, dashArray: "4,4" },
    light: { strokeWidth: 0.5, opacity: 0.25, dashArray: "2,4" },
  }), []);

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
            {/* CSS for animated lines */}
            <style>{`
              @keyframes flowLine {
                0% { stroke-dashoffset: 20; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
              }
              .animated-line {
                animation: flowLine 2s linear infinite;
              }
              .pulse-line {
                animation: pulseGlow 3s ease-in-out infinite;
              }
            `}</style>
            
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
                center: [60, 25],
              }}
              className="w-full h-auto"
              style={{ maxHeight: "500px" }}
            >
              <defs>
                {/* Gradient for connection lines */}
                <linearGradient id="lineGradientPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGradientAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

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

              {/* Animated connection lines */}
              {connectionLines.map((line, index) => {
                const style = lineStyles[line.strength];
                return (
                  <g key={`line-${index}`}>
                    {/* Background glow line */}
                    <Line
                      from={line.from}
                      to={line.to}
                      stroke="url(#lineGradientPrimary)"
                      strokeWidth={style.strokeWidth + 2}
                      strokeOpacity={style.opacity * 0.3}
                      strokeLinecap="round"
                      className="pulse-line"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    />
                    {/* Main animated line */}
                    <Line
                      from={line.from}
                      to={line.to}
                      stroke="url(#lineGradientAccent)"
                      strokeWidth={style.strokeWidth}
                      strokeOpacity={style.opacity}
                      strokeLinecap="round"
                      strokeDasharray={line.strength === "strong" ? "8,4" : style.dashArray}
                      className={line.strength === "strong" ? "animated-line" : ""}
                      style={{ 
                        animationDelay: `${index * 0.15}s`,
                        filter: line.strength === "strong" ? "url(#glow)" : "none"
                      }}
                    />
                  </g>
                );
              })}

              {/* Member markers */}
              {memberLocations.map((location, index) => (
                <Marker
                  key={location.name}
                  coordinates={location.coordinates as [number, number]}
                  onMouseEnter={() => setHoveredLocation(location.name)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  {/* Outer pulse ring for hubs */}
                  {location.isHub && (
                    <circle
                      r={Math.min(location.members / 80, 20) + 6}
                      fill="none"
                      stroke={location.color}
                      strokeWidth={1}
                      opacity={0.3}
                      className="animate-ping"
                      style={{ animationDuration: `${2.5 + index * 0.1}s` }}
                    />
                  )}
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
                      filter: `drop-shadow(0 0 ${location.members > 500 ? 10 : 5}px ${location.color})`,
                    }}
                  />
                  {/* Inner glow */}
                  <circle
                    r={Math.min(location.members / 300, 5) + 1}
                    fill="white"
                    opacity={0.7}
                  />
                  
                  {/* Tooltip */}
                  {hoveredLocation === location.name && (
                    <g>
                      <rect
                        x={-45}
                        y={-50}
                        width={90}
                        height={40}
                        rx={8}
                        fill="hsl(var(--popover))"
                        stroke="hsl(var(--border))"
                        strokeWidth={1}
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
                      />
                      <text
                        textAnchor="middle"
                        y={-32}
                        className="fill-foreground font-semibold"
                        style={{ fontSize: "11px" }}
                      >
                        {location.name}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-18}
                        className="fill-muted-foreground"
                        style={{ fontSize: "9px" }}
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded" />
                <span className="text-sm text-muted-foreground">{t("Unity Network", "ঐক্য নেটওয়ার্ক")}</span>
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
