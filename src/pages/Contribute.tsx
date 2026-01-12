import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDown, PenTool, Shield, Rocket, Heart, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import founderImage from "@/assets/founder.png";

const Contribute = () => {
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
    portfolioLinks: ""
  });

  const scrollToForm = () => {
    document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAreaChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      primaryAreas: checked 
        ? [...prev.primaryAreas, area]
        : prev.primaryAreas.filter(a => a !== area)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.whyUnitynets.split(/\s+/).length < 50) {
      toast.error("Please write at least 50 words in 'Why UnityNets?' section");
      return;
    }

    if (formData.primaryAreas.length === 0) {
      toast.error("Please select at least one area you're strong in");
      return;
    }

    setIsSubmitting(true);

    // For now, just show success - we'll add database storage later
    setTimeout(() => {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
      setIsSubmitting(false);
    }, 1000);
  };

  const contributionAreas = [
    { value: "content", label: "Content & Creation" },
    { value: "ops", label: "Operations & Moderation" },
    { value: "growth", label: "Growth & Outreach" },
    { value: "resources", label: "Resources" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Contribute to UnityNets – Build With Us"
        description="Join as an early builder. Shape a trust-first platform for South Asia's talent. Real influence for real work. No fluff."
        keywords="UnityNets, contribute, builder, volunteer, South Asia, community, open source"
        canonicalUrl="https://unitynets.com/contribute"
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Contribute to UnityNets
            <span className="block text-primary mt-2">Right Now, While It's Early</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A solo founder is building a trust-first platform for South Asia's untapped talent. 
            <span className="text-foreground font-medium"> Early builders get outsized influence.</span>
          </p>

          <div className="text-left md:text-center max-w-2xl mx-auto mb-10 p-6 bg-muted/30 rounded-lg border border-border">
            <p className="text-muted-foreground leading-relaxed">
              UnityNets runs on <span className="text-foreground font-semibold">one person</span> today. No team yet. No funding. 
              Just a clear mission: <span className="text-primary font-semibold">Trust • Learn • Unite</span> — fixing the lack of real, 
              trusted skill-sharing spaces starting from South Asia. If you want to shape something from near-zero 
              instead of joining polished products later — <span className="text-foreground">this is your shot.</span>
            </p>
            <p className="text-sm text-muted-foreground mt-3 italic">Not for comfort-seekers.</p>
          </div>

          <Button 
            onClick={scrollToForm} 
            size="lg" 
            className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Apply to Build
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* What UnityNets Really Is */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">What UnityNets Really Is</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">100% free, no-ads platform.</span> Members share practical 
            <span className="text-primary font-medium"> Unity Notes</span> (guides, tips in tech/freelance/design/business/English/etc.), 
            earn <span className="text-primary font-medium">Trust Score</span> from real value given, connect in groups, exchange help. 
            South Asia focus because that's where massive talent meets massive trust gaps. 
            <span className="text-foreground font-medium"> Goal: Bridge to global unity without the usual toxicity or paywalls.</span>
          </p>
        </div>
      </section>

      {/* Micro Founder Note */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-muted/40 border-muted">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <img 
                  src={founderImage} 
                  alt="Tozammel Haque - Founder" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Ways to Contribute</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <PenTool className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Content & Creation</h3>
                    <p className="text-muted-foreground text-sm">
                      Write/review Unity Notes, tutorials, translations (Bangla-English priority).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Operations & Moderation</h3>
                    <p className="text-muted-foreground text-sm">
                      Curate quality, moderate discussions, run small events/groups.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Growth & Outreach</h3>
                    <p className="text-muted-foreground text-sm">
                      Bring serious members, partner with communities, expand regionally.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Resources</h3>
                    <p className="text-muted-foreground text-sm">
                      Cover tiny costs (hosting ~$5-10/mo) or give strategic input (transparent, receipts shared).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Early Contributors Get */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">What Serious Early Contributors Actually Get</h2>
          <p className="text-sm text-muted-foreground mb-8 italic">Explicit, no safety net.</p>
          
          <ul className="space-y-6">
            <li className="flex gap-4">
              <span className="text-primary font-bold text-lg">→</span>
              <div>
                <span className="font-semibold">Direct influence:</span>
                <span className="text-muted-foreground"> Shape platform direction, features, governance — your voice matters disproportionately now.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold text-lg">→</span>
              <div>
                <span className="font-semibold">Public ownership feel:</span>
                <span className="text-muted-foreground"> Linked contributions, rising Trust Score, visible profile as builder.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold text-lg">→</span>
              <div>
                <span className="font-semibold">Skill + network growth:</span>
                <span className="text-muted-foreground"> Real feedback from diverse talent pool.</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold text-lg">→</span>
              <div>
                <span className="font-semibold">Path to core:</span>
                <span className="text-muted-foreground"> Consistent high-impact → de-facto leadership/core team role (performance only, no promises of money/equity today — but real upside if we succeed).</span>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-primary font-bold text-lg">→</span>
              <div>
                <span className="font-semibold">Impact you can point to:</span>
                <span className="text-muted-foreground"> Help fix a real gap for thousands in South Asia and beyond.</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Who Should NOT Apply */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                <h3 className="text-xl font-bold">Who Should NOT Apply</h3>
              </div>
              
              <ul className="space-y-3 text-muted-foreground ml-10">
                <li>• If you want low-effort "join" credit → <span className="text-foreground">stay a regular member.</span></li>
                <li>• If you're here for quick money, clout, or resume padding → <span className="text-foreground">this isn't it.</span></li>
                <li>• If you can't commit consistent time or handle responsibility → <span className="text-foreground">don't waste our time.</span></li>
              </ul>
              
              <p className="text-sm text-destructive/80 mt-6 font-medium">
                Low-effort or copy-paste applications will be ignored. We review for signal.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-20 px-4 bg-muted/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Application Form</h2>
          <p className="text-muted-foreground text-center mb-10">Higher friction = better filter</p>

          {submitted ? (
            <Card className="border-primary/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Thanks for applying.</h3>
                <p className="text-muted-foreground">
                  We review within 7 days. Only high-signal applicants get a reply.
                </p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCity">Country / City *</Label>
                <Input
                  id="countryCity"
                  required
                  value={formData.countryCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryCity: e.target.value }))}
                  placeholder="e.g. Bangladesh / Dhaka"
                />
              </div>

              <div className="space-y-3">
                <Label>Primary areas you're strong in *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

              <div className="space-y-2">
                <Label htmlFor="skillsProof">Specific skills + proof/experience *</Label>
                <Textarea
                  id="skillsProof"
                  required
                  rows={4}
                  value={formData.skillsProof}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillsProof: e.target.value }))}
                  placeholder='e.g. "Wrote 50+ freelance guides on Medium", "Moderated 10k+ member FB group", "Built 3 React apps"'
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyHours">Realistic weekly hours you can give consistently *</Label>
                <Select
                  value={formData.weeklyHours}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weeklyHours: value }))}
                  required
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="whyUnitynets">
                  Why UnityNets? Why now? Why you think you can add real value? *
                </Label>
                <p className="text-xs text-muted-foreground">
                  150+ words expected. Generic answers rejected.
                </p>
                <Textarea
                  id="whyUnitynets"
                  required
                  rows={6}
                  value={formData.whyUnitynets}
                  onChange={(e) => setFormData(prev => ({ ...prev, whyUnitynets: e.target.value }))}
                  placeholder="Be specific. Why this platform? Why now in your life? What unique value can you bring that others can't?"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.whyUnitynets.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioLinks" className="flex items-center gap-2">
                  Portfolio / GitHub / LinkedIn / X / previous community proof
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Textarea
                  id="portfolioLinks"
                  rows={2}
                  value={formData.portfolioLinks}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioLinks: e.target.value }))}
                  placeholder="Optional but helpful. One link per line."
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg py-6 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit – Serious Applications Only"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-bold mb-8">
            Comfort is for users.
            <span className="text-primary"> Responsibility is for builders.</span>
          </p>
          <p className="text-xl text-muted-foreground mb-8">If you're the latter — prove it.</p>
          <Button onClick={scrollToForm} size="lg" className="text-lg px-8 py-6 font-semibold">
            Shape UnityNets Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            100% Free • No Ads • Early Stage • Solo Founder Seeking Co-Builders
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} UnityNets. Trust • Learn • Unite
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Contribute;
