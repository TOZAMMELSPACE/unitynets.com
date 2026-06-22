import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Users,
  Compass,
  Check,
  Globe,
  Handshake,
  Star,
  GraduationCap,
  CalendarHeart,
  Zap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const COUNTRIES = [
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "India", flag: "🇮🇳" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Nepal", flag: "🇳🇵" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Bhutan", flag: "🇧🇹" },
  { name: "Maldives", flag: "🇲🇻" },
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Myanmar", flag: "🇲🇲" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Cambodia", flag: "🇰🇭" },
  { name: "Laos", flag: "🇱🇦" },
  { name: "Papua New Guinea", flag: "🇵🇬" },
];

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  country: z.string().min(1, "Please select your country"),
  age: z.coerce.number().int().min(13, "You must be at least 13").max(100),
  social_handle: z.string().trim().min(1, "Social handle is required").max(200),
  why_ambassador: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters")
    .refine((v) => v.trim().split(/\s+/).length <= 300, "Max 300 words"),
  contribution: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters")
    .refine((v) => v.trim().split(/\s+/).length <= 300, "Max 300 words"),
});

// Reveal-on-scroll hook
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

const AmbassadorProgram = () => {
  useReveal();
  const formRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    age: "",
    social_handle: "",
    why_ambassador: "",
    contribution: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors and try again.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("ambassador_applications")
      .insert(parsed.data as any);
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    toast.success("Application submitted successfully!");
    setSuccess(true);
    setForm({
      name: "",
      email: "",
      country: "",
      age: "",
      social_handle: "",
      why_ambassador: "",
      contribution: "",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Unity Ambassador Program | UnityNets"
        description="Become a Unity Ambassador. Represent your nation. Unite a generation. Shape the future of South & Southeast Asia."
      />

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <ParticleBg />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
          <div data-reveal className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Star className="h-3.5 w-3.5" /> UnityNets Ambassador Program
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Become a{" "}
              <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Unity Ambassador
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Represent your nation. Unite a generation. Shape the future of
              South &amp; Southeast Asia.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-elegant"
                onClick={() => scrollTo(formRef)}
              >
                Apply Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => scrollTo(aboutRef)}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="relative overflow-hidden py-24 px-6 bg-gradient-to-b from-background via-card/20 to-background">
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="relative mx-auto max-w-3xl">
          <div data-reveal className="reveal text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Star className="h-3.5 w-3.5" /> The UnityNets Manifesto
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold sm:text-5xl">
              A Declaration for the Youth of{" "}
              <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                South &amp; Southeast Asia
              </span>
            </h2>
          </div>

          <article className="reveal space-y-12 rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-8 sm:p-12 shadow-elegant" data-reveal>
            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">We Were Never Meant to Be Divided.</h3>
              <div className="mt-4 space-y-2 text-foreground/90 leading-relaxed">
                <p>Before the borders were drawn —</p>
                <p>before the wars were fought over lines on a map —</p>
                <p>before religion became a weapon and language became a wall —</p>
                <p className="font-semibold">we were neighbors.</p>
                <p>We shared rivers. We shared spices. We shared stories.</p>
                <p>We built temples and mosques and stupas side by side.</p>
                <p>We sailed the same seas. We looked up at the same stars.</p>
                <p className="pt-2 italic text-muted-foreground">Then someone came. Drew lines. And told us to hate each other.</p>
                <p className="pt-2 text-xl font-bold text-primary">We refuse.</p>
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">Who We Are</h3>
              <div className="mt-4 space-y-3 text-foreground/90 leading-relaxed">
                <p>We are the youth of Bangladesh, India, Pakistan, Nepal, Sri Lanka, Bhutan, Maldives, Afghanistan, Myanmar, Thailand, Vietnam, Malaysia, Indonesia, Philippines, Cambodia, Laos, and Papua New Guinea.</p>
                <p className="text-lg font-semibold">We are 3 billion people.</p>
                <p>We are the largest, youngest, most diverse generation this region has ever seen.</p>
                <p>And we are done waiting for politicians to build the bridges they keep burning.</p>
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">What We Believe</h3>
              <ul className="mt-4 space-y-3 text-foreground/90 leading-relaxed list-none">
                <li>We believe that <strong>culture is stronger than conflict</strong>.</li>
                <li>We believe that a student in Dhaka and a student in Jakarta have more in common than their governments want them to know.</li>
                <li>We believe that peace is not the absence of difference — it is the courage to connect across it.</li>
                <li>We believe that technology can do what diplomacy has failed to do — bring ordinary people together, across borders, in real time.</li>
                <li>We believe that South and Southeast Asia is not a collection of problems to be solved — it is a <strong>civilization to be awakened</strong>.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">What We Reject</h3>
              <ul className="mt-4 space-y-3 text-foreground/90 leading-relaxed list-none">
                <li>We reject the idea that our divisions are natural.</li>
                <li>We reject hatred dressed up as patriotism.</li>
                <li>We reject leaders who grow powerful by keeping us afraid of each other.</li>
                <li>We reject the silence that lets injustice continue unchallenged.</li>
                <li>We reject the belief that one person cannot change the direction of history.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">What We Are Building</h3>
              <div className="mt-4 space-y-3 text-foreground/90 leading-relaxed">
                <p>UnityNets is not just a platform.</p>
                <p>It is a promise —</p>
                <p>that every young person in this region deserves a community that sees them, a network that empowers them, and a movement that gives their voice a stage.</p>
                <p className="pt-2 font-semibold">We are building:</p>
                <ul className="space-y-2 pl-5 list-disc marker:text-primary">
                  <li>A network of ambassadors — one in every nation, rooted in every community</li>
                  <li>A shared identity — not erasing our differences, but celebrating them as our greatest strength</li>
                  <li>A digital home for 3 billion voices that have never been heard together before</li>
                  <li>An annual gathering — where the youth of Asia look each other in the eye and choose unity over division</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">Our Commitment</h3>
              <div className="mt-4 space-y-2 text-foreground/90 leading-relaxed">
                <p>We will not wait for permission.</p>
                <p>We will not wait for the perfect moment.</p>
                <p>We will not wait for someone else to do it first.</p>
                <p className="pt-2">We commit to showing up — online and offline, in our cities and our villages, in our languages and our silences — to build the connections that no border can break.</p>
                <p>We commit to leading with empathy before ego.</p>
                <p>To listening before speaking.</p>
                <p>To building before claiming credit.</p>
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold text-primary">The Call</h3>
              <div className="mt-4 space-y-3 text-foreground/90 leading-relaxed">
                <p>If you are between 18 and 30 —</p>
                <p>if you have ever looked at this region and thought <em>"we could be so much more"</em> —</p>
                <p>if you have ever felt the pain of a division you did not choose —</p>
                <p className="font-semibold">this is your movement.</p>
                <p className="text-lg">Not ours. <span className="text-primary font-bold">Yours.</span></p>
                <p className="pt-2">We are not asking you to follow.</p>
                <p>We are asking you to <strong>lead</strong> — in your city, your campus, your community.</p>
                <p className="pt-2">One ambassador per nation.</p>
                <p>One network across a continent.</p>
                <p>One generation that finally chooses unity.</p>
              </div>
            </div>

            <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-lg sm:text-xl text-foreground/90">
              "Borders are scars on the earth. We are here to heal them."
              <footer className="mt-3 not-italic text-sm text-muted-foreground">— UnityNets, 2026</footer>
            </blockquote>

            <div className="text-center pt-2">
              <p className="font-display text-2xl font-bold mb-5">Join Us.</p>
              <Button size="lg" className="h-12 px-10 text-base shadow-elegant" onClick={() => scrollTo(formRef)}>
                Become an Ambassador
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">unitynets.com/ambassador</p>
            </div>
          </article>
        </div>
      </section>

      {/* WHAT IS AN AMBASSADOR */}
      <section ref={aboutRef} className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              What is an Ambassador?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Three core roles that shape the movement in your country.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Megaphone,
                title: "Represent",
                desc: "Be the voice of UnityNets in your country.",
              },
              {
                icon: Users,
                title: "Connect",
                desc: "Build local youth communities across 17+ nations.",
              },
              {
                icon: Compass,
                title: "Lead",
                desc: "Organize events, summits, and campaigns in your region.",
              },
            ].map((c, i) => (
              <div
                key={c.title}
                data-reveal
                className="reveal group rounded-2xl border border-border/50 bg-card p-8 shadow-elegant transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <c.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO CAN APPLY */}
      <section className="py-24 px-6 bg-card/30">
        <div className="mx-auto max-w-4xl">
          <div data-reveal className="reveal text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Who Can Apply?
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              "From any South or Southeast Asian country",
              "Passionate about unity, peace, and regional cooperation",
              "Active on at least one social media platform",
              "Willing to commit 10–20 hours/month",
            ].map((item) => (
              <li
                key={item}
                data-reveal
                className="reveal flex items-start gap-3 rounded-xl border border-border/50 bg-background p-5"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* COUNTRIES */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Countries We're Recruiting From
            </h2>
            <p className="mt-4 text-muted-foreground">
              17 nations. One united generation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {COUNTRIES.map((c) => (
              <div
                key={c.name}
                data-reveal
                className="reveal flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition hover:border-primary/40 hover:-translate-y-0.5"
              >
                <span className="text-2xl" aria-hidden>
                  {c.flag}
                </span>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-24 px-6 bg-card/30">
        <div className="mx-auto max-w-5xl">
          <div data-reveal className="reveal text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ambassador Benefits
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { icon: Globe, text: "Official UnityNets Ambassador Badge & Certificate" },
              { icon: Handshake, text: "Access to exclusive Ambassador Network (private community)" },
              { icon: Star, text: "Featured on UnityNets website and social media" },
              { icon: GraduationCap, text: "Leadership & organizing training resources" },
              { icon: CalendarHeart, text: "Invitation to annual South & Southeast Asian Youth Summit" },
              { icon: Zap, text: "Direct line to UnityNets core team" },
            ].map((b) => (
              <div
                key={b.text}
                data-reveal
                className="reveal flex items-start gap-4 rounded-xl border border-border/50 bg-background p-5"
              >
                <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <p className="pt-2 text-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section ref={formRef} className="py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <div data-reveal className="reveal text-center mb-10">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Application Form
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fill in your details — we'll get back within 7 days.
            </p>
          </div>

          {success ? (
            <div
              data-reveal
              className="reveal rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center shadow-elegant"
            >
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h3 className="mt-4 font-display text-2xl font-semibold">
                Thank you!
              </h3>
              <p className="mt-3 text-muted-foreground">
                We'll review your application and reach out within 7 days.
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => setSuccess(false)}
              >
                Submit another
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-reveal
              className="reveal space-y-5 rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-elegant"
            >
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => setForm({ ...form, country: v })}
                  >
                    <SelectTrigger id="country" className="mt-1.5">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="mt-1 text-sm text-destructive">{errors.country}</p>}
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min={13}
                    max={100}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="mt-1.5"
                    placeholder="18"
                  />
                  {errors.age && <p className="mt-1 text-sm text-destructive">{errors.age}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="social">Social Media Handle *</Label>
                <Input
                  id="social"
                  value={form.social_handle}
                  onChange={(e) => setForm({ ...form, social_handle: e.target.value })}
                  className="mt-1.5"
                  placeholder="@yourhandle (Instagram, X, LinkedIn, etc.)"
                />
                {errors.social_handle && <p className="mt-1 text-sm text-destructive">{errors.social_handle}</p>}
              </div>

              <div>
                <Label htmlFor="why">Why do you want to be a Unity Ambassador? *</Label>
                <Textarea
                  id="why"
                  rows={5}
                  value={form.why_ambassador}
                  onChange={(e) => setForm({ ...form, why_ambassador: e.target.value })}
                  className="mt-1.5"
                  placeholder="Share your motivation (max 300 words)"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.why_ambassador.trim() ? form.why_ambassador.trim().split(/\s+/).length : 0}/300 words
                </p>
                {errors.why_ambassador && <p className="mt-1 text-sm text-destructive">{errors.why_ambassador}</p>}
              </div>

              <div>
                <Label htmlFor="contribution">How will you contribute to unity in your region? *</Label>
                <Textarea
                  id="contribution"
                  rows={5}
                  value={form.contribution}
                  onChange={(e) => setForm({ ...form, contribution: e.target.value })}
                  className="mt-1.5"
                  placeholder="Your ideas, plans, or projects (max 300 words)"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.contribution.trim() ? form.contribution.trim().split(/\s+/).length : 0}/300 words
                </p>
                {errors.contribution && <p className="mt-1 text-sm text-destructive">{errors.contribution}</p>}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit My Application"
                )}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-teal-500/15 to-emerald-500/20" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 data-reveal className="reveal font-display text-3xl font-bold sm:text-5xl">
            Together, we are{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              3 billion voices.
            </span>
          </h2>
          <div data-reveal className="reveal mt-8">
            <Button
              size="lg"
              className="h-12 px-10 text-base shadow-elegant"
              onClick={() => scrollTo(formRef)}
            >
              Apply Now
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-in { opacity: 1 !important; transform: translateY(0) !important; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default AmbassadorProgram;
