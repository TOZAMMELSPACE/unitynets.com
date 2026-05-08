import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Be Part of Something{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-glow)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Bigger Than Yourself
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join a movement of learners, creators, and changemakers building a kinder, more connected world.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              className="text-base px-8 py-6 rounded-full group bg-gradient-hero shadow-glow hover:shadow-[0_0_45px_hsl(var(--primary)/0.45)] hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
              onClick={() => navigate("/about")}
            >
              Explore Mission
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";
export default FinalCTASection;
