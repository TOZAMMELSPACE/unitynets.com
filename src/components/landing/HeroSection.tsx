import { memo, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe, Users, Sparkles, FileText } from "lucide-react";
import { useRealStats } from "@/hooks/useRealStats";

// Lazy load the heavy world map only when user scrolls down
const WorldMapSection = lazy(() => import("@/components/landing/WorldMapSection"));

export const HeroSection = () => {
  const navigate = useNavigate();
  const { activeUsers, totalPosts, isLoading } = useRealStats();

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Simple animated background instead of heavy map */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Globe className="w-4 h-4" />
              <span>World's Trusted Community Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
              Trust{" "}
              <span className="text-primary">•</span> Learn{" "}
              <span className="text-primary">•</span> Unite
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Building bridges of unity from South Asia to the world. 
              Join for skill sharing, learning, and mutual growth.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isLoading ? "..." : `${activeUsers}+`}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Active Members</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isLoading ? "..." : `${totalPosts}+`}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Posts Shared</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">20+</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Countries</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/auth")}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 rounded-full"
                onClick={() => navigate("/about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* World Map - Lazy loaded below the fold */}
      <Suspense fallback={
        <div className="py-12 flex justify-center">
          <div className="animate-pulse h-64 w-full max-w-4xl bg-muted/20 rounded-lg" />
        </div>
      }>
        <WorldMapSection />
      </Suspense>
    </>
  );
};

export default memo(HeroSection);
