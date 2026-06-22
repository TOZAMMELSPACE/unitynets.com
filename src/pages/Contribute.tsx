import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowDown,
  PenTool,
  Shield,
  Rocket,
  Heart,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import founderImage from "@/assets/founder.png";
import { supabase } from "@/integrations/supabase/client";

// Reveal-on-scroll hook (matches Ambassador page)
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const ParticleBg = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
    <div
      className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl animate-pulse"
      style={{ animationDelay: "1.5s" }}
    />
    <div
      className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl animate-pulse"
      style={{ animationDelay: "3s" }}
    />
    <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] [background-size:32px_32px]" />
  </div>
);

const Contribute = () => {
  useReveal();
  const formRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCity: "",
    primaryAreas: [] as string[],
    skillsProof: "",
    weeklyHours: "",
    whyUnitynets: "",
    portfolioLinks: "",
  });

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleAreaChange = (area: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      primaryAreas: checked
        ? [...prev.primaryAreas, area]
        : prev.primaryAreas.filter((a) => a !== area),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.whyUnitynets.split(/\s+/).filter(Boolean).length < 50) {
      toast.error("Please write at least 50 words in 'Why UnityNets?' section");
      return;
    }
    if (formData.primaryAreas.length === 0) {
      toast.error("Please select at least one area you're strong in");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contributor_applications").insert({
        full_name: formData.fullName,
        email: formData.email,
        country_city: formData.countryCity,
        primary_areas: formData.primaryAreas,
        skills_proof: formData.skillsProof,
        weekly_hours: formData.weeklyHours,
        why_unitynets: formData.whyUnitynets,
        portfolio_links: formData.portfolioLinks || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contributionAreas = [
    { value: "content", label: "Content & Creation" },
    { value: "ops", label: "Operations & Moderation" },
    { value: "growth", label: "Growth & Outreach" },
    { value: "resources", label: "Resources" },
    { value: "other", label: "Other" },
  ];

  const ways = [
    {
      icon: PenTool,
      title: "Content & Creation",
      desc: "Write/review Unity Notes, tutorials, translations (Bangla–English priority).",
    },
    {
      icon: Shield,
      title: "Operations & Moderation",
      desc: "Curate quality, moderate discussions, run small events/groups.",
    },
    {
      icon: Rocket,
      title: "Growth & Outreach",
      desc: "Bring serious members, partner with communities, expand regionally.",
    },
    {
      icon: Heart,
      title: "Resources",
      desc: "Cover tiny costs (hosting ~$5–10/mo) or give strategic input (transparent, receipts shared).",
    },
  ];

  const perks = [
    {
      title: "Direct influence",
      desc: "Shape platform direction, features, governance — your voice matters disproportionately now.",
    },
    {
      title: "Public ownership feel",
      desc: "Linked contributions, rising Trust Score, visible profile as builder.",
    },
    {
      title: "Skill + network growth",
      desc: "Real feedback from a diverse talent pool.",
    },
    {
      title: "Path to core",
      desc: "Consistent high-impact → de-facto leadership/core team role (performance only, no promises of money/equity today — but real upside if we succeed).",
    },
    {
      title: "Impact you can point to",
      desc: "Help fix a real gap for thousands in South Asia and beyond.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Contribute to UnityNets – Build With Us"
        description="Join as an early builder. Shape a trust-first platform for South Asia's talent. Real influence for real work. No fluff."
        keywords="UnityNets, contribute, builder, volunteer, South Asia, community, open source"
        canonicalUrl="https://unitynets.com/contribute"
      />

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <ParticleBg />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
          <div data-reveal className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Early Builders Wanted
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Contribute to UnityNets
              <span className="block mt-3 bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Right Now, While It's Early
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
              A solo founder is building a trust-first platform for South Asia's untapped talent.{" "}
              <span className="text-foreground font-medium">
                Early builders get outsized influence.
              </span>
            </p>

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-6 text-left sm:text-center shadow-elegant">
              <p className="text-muted-foreground leading-relaxed">
                UnityNets runs on <span className="text-foreground font-semibold">one person</span> today. No team yet. No funding.
                Just a clear mission: <span className="text-primary font-semibold">Trust • Learn • Unite</span> — fixing the lack of real,
                trusted skill-sharing spaces starting from South Asia. If you want to shape something from near-zero
                instead of joining polished products later — <span className="text-foreground">this is your shot.</span>
              </p>
              <p className="text-sm text-muted-foreground mt-3 italic">Not for comfort-seekers.</p>
            </div>

            <div className="mt-10">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-elegant"
                onClick={scrollToForm}
              >
                Apply to Build
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IT REALLY IS */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div data-reveal className="reveal text-center mb-10">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              What UnityNets Really Is
            </h2>
          </div>
          <div
            data-reveal
            className="reveal rounded-2xl border border-border/50 bg-card p-8 sm:p-10 shadow-elegant"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">100% free, no-ads platform.</span> Members share practical{" "}
              <span className="text-primary font-medium">Unity Notes</span> (guides, tips in tech/freelance/design/business/English/etc.),
              earn <span className="text-primary font-medium">Trust Score</span> from real value given, connect in groups, exchange help.
              South Asia focus because that's where massive talent meets massive trust gaps.{" "}
              <span className="text-foreground font-medium">
                Goal: Bridge to global unity without the usual toxicity or paywalls.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="py-16 px-6 bg-card/30">
        <div className="mx-auto max-w-3xl">
          <div
            data-reveal
            className="reveal rounded-2xl border border-border/50 bg-background p-6 sm:p-8 shadow-elegant"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <img
                src={founderImage}
                alt="Tozammel Haque - Founder"
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
              />
              <div>
                <p className="text-muted-foreground italic leading-relaxed">
                  "I'm doing this alone so far because I believe in it. But I can't scale it solo.
                  If you're smarter/faster/better connected in any area — I want you in.
                  Early people won't just 'help' — you'll directly decide features, rules, and direction as we grow.
                  <span className="text-foreground font-medium not-italic"> No fluff. Real skin.</span>"
                </p>
                <p className="text-sm text-foreground font-medium mt-4">
                  — Tozammel Haque, Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WAYS TO CONTRIBUTE */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ways to Contribute
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Pick the lane where you're strongest. Mix lanes if you can.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {ways.map((w, i) => (
              <div
                key={w.title}
                data-reveal
                className="reveal group rounded-2xl border border-border/50 bg-card p-8 shadow-elegant transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <w.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold">{w.title}</h3>
                <p className="mt-2 text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-24 px-6 bg-card/30">
        <div className="mx-auto max-w-4xl">
          <div data-reveal className="reveal text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              What Serious Early Contributors Actually Get
            </h2>
            <p className="mt-3 text-sm text-muted-foreground italic">
              Explicit, no safety net.
            </p>
          </div>
          <div className="grid gap-5">
            {perks.map((p) => (
              <div
                key={p.title}
                data-reveal
                className="reveal flex items-start gap-4 rounded-xl border border-border/50 bg-background p-5"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">
                  →
                </span>
                <div>
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="mt-1 text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO SHOULD NOT APPLY */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div
            data-reveal
            className="reveal rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 shadow-elegant"
          >
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <h3 className="font-display text-xl font-bold">Who Should NOT Apply</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground ml-10">
              <li>• If you want low-effort "join" credit → <span className="text-foreground">stay a regular member.</span></li>
              <li>• If you're here for quick money, clout, or resume padding → <span className="text-foreground">this isn't it.</span></li>
              <li>• If you can't commit consistent time or handle responsibility → <span className="text-foreground">don't waste our time.</span></li>
            </ul>
            <p className="text-sm text-destructive/80 mt-6 font-medium">
              Low-effort or copy-paste applications will be ignored. We review for signal.
            </p>
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section ref={formRef} id="application-form" className="py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <div data-reveal className="reveal text-center mb-10">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Application Form
            </h2>
            <p className="mt-3 text-muted-foreground">
              Higher friction = better filter.
            </p>
          </div>

          {submitted ? (
            <div
              data-reveal
              className="reveal rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center shadow-elegant"
            >
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h3 className="mt-4 font-display text-2xl font-semibold">
                Thanks for applying.
              </h3>
              <p className="mt-3 text-muted-foreground">
                We review within 7 days. Only high-signal applicants get a reply.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-reveal
              className="reveal space-y-5 rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-elegant"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1.5"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1.5"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="countryCity">Country / City *</Label>
                <Input
                  id="countryCity"
                  required
                  value={formData.countryCity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, countryCity: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g. Bangladesh / Dhaka"
                />
              </div>

              <div>
                <Label>Primary areas you're strong in *</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {contributionAreas.map((area) => (
                    <div key={area.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.value}
                        checked={formData.primaryAreas.includes(area.value)}
                        onCheckedChange={(checked) => handleAreaChange(area.value, checked as boolean)}
                      />
                      <Label htmlFor={area.value} className="text-sm font-normal cursor-pointer">
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="skillsProof">Specific skills + proof/experience *</Label>
                <Textarea
                  id="skillsProof"
                  required
                  rows={4}
                  value={formData.skillsProof}
                  onChange={(e) => setFormData((prev) => ({ ...prev, skillsProof: e.target.value }))}
                  className="mt-1.5"
                  placeholder='e.g. "Wrote 50+ freelance guides on Medium", "Moderated 10k+ member FB group", "Built 3 React apps"'
                />
              </div>

              <div>
                <Label htmlFor="weeklyHours">Realistic weekly hours you can give consistently *</Label>
                <Select
                  value={formData.weeklyHours}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, weeklyHours: value }))}
                  required
                >
                  <SelectTrigger id="weeklyHours" className="mt-1.5">
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<2h">&lt;2 hours (probably not a fit)</SelectItem>
                    <SelectItem value="2-5h">2-5 hours</SelectItem>
                    <SelectItem value="5-10h">5-10 hours</SelectItem>
                    <SelectItem value="10+h">10+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="whyUnitynets">
                  Why UnityNets? Why now? Why you think you can add real value? *
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  150+ words expected. Generic answers rejected.
                </p>
                <Textarea
                  id="whyUnitynets"
                  required
                  rows={6}
                  value={formData.whyUnitynets}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whyUnitynets: e.target.value }))}
                  className="mt-1.5"
                  placeholder="Be specific. Why this platform? Why now in your life? What unique value can you bring that others can't?"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {formData.whyUnitynets.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <div>
                <Label htmlFor="portfolioLinks" className="flex items-center gap-2">
                  Portfolio / GitHub / LinkedIn / X / previous community proof
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Textarea
                  id="portfolioLinks"
                  rows={2}
                  value={formData.portfolioLinks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, portfolioLinks: e.target.value }))}
                  className="mt-1.5"
                  placeholder="Optional but helpful. One link per line."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit – Serious Applications Only"
                )}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-teal-500/15 to-emerald-500/20" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 data-reveal className="reveal font-display text-3xl font-bold sm:text-5xl">
            Comfort is for users.{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Responsibility is for builders.
            </span>
          </h2>
          <p data-reveal className="reveal mt-6 text-xl text-muted-foreground">
            If you're the latter — prove it.
          </p>
          <div data-reveal className="reveal mt-8">
            <Button
              size="lg"
              className="h-12 px-10 text-base shadow-elegant"
              onClick={scrollToForm}
            >
              Shape UnityNets Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-in { opacity: 1 !important; transform: translateY(0) !important; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default Contribute;
