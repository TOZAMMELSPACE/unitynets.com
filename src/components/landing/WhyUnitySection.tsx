import { memo } from "react";
import { BookOpen, Shield, Globe } from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Learn Skills",
    desc: "Free lessons, notes, and mentors from a worldwide learning community.",
  },
  {
    icon: Shield,
    title: "Build Trust",
    desc: "Earn a transparent Trust Score by helping, sharing, and contributing.",
  },
  {
    icon: Globe,
    title: "Connect Globally",
    desc: "Meet creators, students, and changemakers from over 50 countries.",
  },
];

const WhyUnitySection = memo(() => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Why UnityNets
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple promises that make our community different.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {items.map((it, i) => (
            <div
              key={i}
              className="group relative bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl p-8 text-center hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              style={{ opacity: 0, animation: `fade-in 0.5s ease-out ${150 + i * 100}ms forwards` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <it.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{it.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

WhyUnitySection.displayName = "WhyUnitySection";
export default WhyUnitySection;
