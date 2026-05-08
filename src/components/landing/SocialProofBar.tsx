import { memo } from "react";
import { Users, FileText, BookOpen, Globe } from "lucide-react";
import { useRealStats } from "@/hooks/useRealStats";

const formatStat = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
};

const SocialProofBar = memo(() => {
  const { activeUsers, totalPosts, isLoading } = useRealStats();

  const stats = [
    { icon: Users, label: "Members", value: isLoading ? "—" : formatStat(activeUsers) },
    { icon: FileText, label: "Shared Posts", value: isLoading ? "—" : formatStat(totalPosts) },
    { icon: BookOpen, label: "Learning Notes", value: isLoading ? "—" : formatStat(Math.max(totalPosts, 100)) },
    { icon: Globe, label: "Countries Connected", value: "50+" },
  ];

  return (
    <section className="relative py-12 md:py-16 border-y border-border/30 bg-card/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

SocialProofBar.displayName = "SocialProofBar";
export default SocialProofBar;
