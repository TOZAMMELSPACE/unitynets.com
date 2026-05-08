import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroIllustration from "@/assets/hero-unity-illustration.jpg";

const MinimalHero = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12">
      {/* Soft background gradients */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="absolute top-20 right-[8%] w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 left-[5%] w-72 h-72 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-7 text-center lg:text-left" style={{ opacity: 0, animation: "fade-in 0.7s ease-out 0.1s forwards" }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-medium border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A free global community</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              <span className="text-foreground">Trust. Learn. </span>
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-glow)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Unite.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              A free global community where people share knowledge, build trust, and grow together.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-full group bg-gradient-hero shadow-glow hover:shadow-[0_0_45px_hsl(var(--primary)/0.45)] hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Join the World Community
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
                onClick={() => navigate("/auth?mode=login")}
              >
                Login
              </Button>
            </div>

            <p className="text-sm text-muted-foreground/80 pt-1">
              100% Free  •  No Ads  •  Community Driven
            </p>
          </div>

          {/* Right — illustration */}
          <div className="flex justify-center lg:justify-end" style={{ opacity: 0, animation: "fade-in 0.8s ease-out 0.3s forwards" }}>
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-6 bg-primary/15 rounded-[2rem] blur-[60px]" />
              <div className="relative rounded-[2rem] overflow-hidden border border-border/30 shadow-elegant bg-card/40 backdrop-blur-xl">
                <img
                  src={heroIllustration}
                  alt="Diverse community connecting globally on UnityNets"
                  width={1024}
                  height={1024}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

MinimalHero.displayName = "MinimalHero";
export default MinimalHero;
