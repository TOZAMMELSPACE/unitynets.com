import { memo, useState, useMemo } from "react";
import { Star, Quote, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

type Category = "all" | "skills" | "community" | "support";

export const TestimonialsSection = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [minRating, setMinRating] = useState<number>(0);

  const testimonials = [
    {
      name: t("Rahul Ahmed", "রাহুল আহমেদ"),
      role: t("Software Developer", "সফটওয়্যার ডেভেলপার"),
      avatar: "",
      quote: t(
        "After joining UnityNets, I learned many new skills. The people here are truly helpful.",
        "ইউনিটিনেটসে যোগ দেওয়ার পর আমি অনেক নতুন দক্ষতা শিখেছি। এখানকার মানুষগুলো সত্যিই সাহায্যকারী।"
      ),
      rating: 5,
      category: "skills" as Category,
      gradient: "from-primary to-accent",
    },
    {
      name: t("Fatima Khatun", "ফাতিমা খাতুন"),
      role: t("Graphic Designer", "গ্রাফিক ডিজাইনার"),
      avatar: "",
      quote: t(
        "Sharing my work on this platform got me valuable feedback that helped me improve.",
        "এই প্ল্যাটফর্মে আমি আমার কাজ শেয়ার করে অনেক ফিডব্যাক পেয়েছি যা আমাকে উন্নত করতে সাহায্য করেছে।"
      ),
      rating: 4,
      category: "skills" as Category,
      gradient: "from-accent to-success",
    },
    {
      name: t("Arif Hasan", "আরিফ হাসান"),
      role: t("Entrepreneur", "উদ্যোক্তা"),
      avatar: "",
      quote: t(
        "This platform is amazing for building business connections. I got my first client from here.",
        "ব্যবসায়িক সংযোগ তৈরি করতে এই প্ল্যাটফর্ম অসাধারণ। এখান থেকেই আমি আমার প্রথম ক্লায়েন্ট পেয়েছি।"
      ),
      rating: 5,
      category: "community" as Category,
      gradient: "from-success to-primary",
    },
    {
      name: t("Nusrat Jahan", "নুসরাত জাহান"),
      role: t("Student", "শিক্ষার্থী"),
      avatar: "",
      quote: t(
        "Unity Notes provided me with so many helpful study materials. Getting all this for free is incredible.",
        "ইউনিটি নোটস থেকে পড়াশোনার জন্য অনেক সহায়ক নোট পেয়েছি। বিনামূল্যে এত কিছু পাওয়া সত্যিই অবিশ্বাস্য।"
      ),
      rating: 5,
      category: "support" as Category,
      gradient: "from-warning to-primary",
    },
    {
      name: t("Karim Uddin", "করিম উদ্দিন"),
      role: t("Freelancer", "ফ্রিল্যান্সার"),
      avatar: "",
      quote: t(
        "I've met people here who are now my good friends. The community is truly genuine.",
        "এখানে আমি এমন মানুষদের সাথে পরিচিত হয়েছি যারা আজ আমার ভালো বন্ধু। কমিউনিটিটা সত্যিই আন্তরিক।"
      ),
      rating: 5,
      category: "community" as Category,
      gradient: "from-primary to-success",
    },
    {
      name: t("Sara Begum", "সারা বেগম"),
      role: t("Content Creator", "কন্টেন্ট ক্রিয়েটর"),
      avatar: "",
      quote: t(
        "Sharing my content here gives me so much inspiration. This platform changed my life.",
        "আমার কন্টেন্ট এখানে শেয়ার করে অনেক অনুপ্রেরণা পাই। এই প্ল্যাটফর্ম আমার জীবন বদলে দিয়েছে।"
      ),
      rating: 4,
      category: "support" as Category,
      gradient: "from-accent to-warning",
    },
  ];

  const categories: { value: Category; label: string }[] = [
    { value: "all", label: t("All", "সব") },
    { value: "skills", label: t("Skills", "দক্ষতা") },
    { value: "community", label: t("Community", "কমিউনিটি") },
    { value: "support", label: t("Support", "সাপোর্ট") },
  ];

  const ratingOptions = [
    { value: 0, label: t("All Ratings", "সব রেটিং") },
    { value: 5, label: "5 ★" },
    { value: 4, label: "4+ ★" },
    { value: 3, label: "3+ ★" },
  ];

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const catMatch = selectedCategory === "all" || t.category === selectedCategory;
      const ratingMatch = t.rating >= minRating;
      return catMatch && ratingMatch;
    });
  }, [selectedCategory, minRating, testimonials]);

  // Counts per category respect current rating filter
  const categoryCounts = useMemo(() => {
    const base = testimonials.filter((t) => t.rating >= minRating);
    return {
      all: base.length,
      skills: base.filter((t) => t.category === "skills").length,
      community: base.filter((t) => t.category === "community").length,
      support: base.filter((t) => t.category === "support").length,
    } as Record<Category, number>;
  }, [testimonials, minRating]);

  // Counts per rating option respect current category filter
  const ratingCounts = useMemo(() => {
    const base = testimonials.filter(
      (t) => selectedCategory === "all" || t.category === selectedCategory
    );
    return ratingOptions.reduce<Record<number, number>>((acc, opt) => {
      acc[opt.value] = base.filter((t) => t.rating >= opt.value).length;
      return acc;
    }, {});
  }, [testimonials, selectedCategory]);

  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,hsl(var(--accent)/0.05),transparent)]" />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14" style={{ opacity: 0, animation: "fade-in 0.6s ease-out 0.1s forwards" }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium border border-primary/20 backdrop-blur-sm mb-6">
            {t("Real Voices", "বাস্তব কণ্ঠস্বর")}
          </div>
          <h2 className="section-header mb-5 text-3xl md:text-4xl">
            {t("What Our Members Say", "আমাদের মেম্বাররা কী বলছেন")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            {t(
              "Thousands of people are already improving their lives at UnityNets",
              "হাজারো মানুষ ইতিমধ্যে ইউনিটিনেটসে তাদের জীবন উন্নত করছে"
            )}
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="max-w-4xl mx-auto mb-10 bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4 md:p-5"
          style={{ opacity: 0, animation: "fade-in 0.5s ease-out 250ms forwards" }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            {/* Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-muted-foreground mr-1">
                {t("Category", "ক্যাটাগরি")}:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-muted/40 text-muted-foreground border-border/30 hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden md:block w-px h-8 bg-border/40" />

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <Star className="w-4 h-4 text-warning fill-warning shrink-0" />
              <span className="text-xs font-medium text-muted-foreground mr-1">
                {t("Rating", "রেটিং")}:
              </span>
              {ratingOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMinRating(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                    minRating === opt.value
                      ? "bg-warning text-background border-warning shadow-glow"
                      : "bg-muted/40 text-muted-foreground border-border/30 hover:border-warning/40 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {t("No testimonials match your filters.", "কোন টেস্টিমোনিয়াল পাওয়া যায়নি।")}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {filteredTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="group relative bg-card/50 backdrop-blur-xl border border-border/30 rounded-3xl p-7 hover:shadow-glow hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                style={{ opacity: 0, animation: `fade-in 0.5s ease-out ${200 + index * 100}ms forwards` }}
              >
                {/* Hover glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-primary/15" />

                {/* Top accent line */}
                <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                {/* Quote Icon */}
                <div className={`absolute top-5 right-5 w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.gradient} opacity-10 group-hover:opacity-20 flex items-center justify-center transition-opacity duration-500`}>
                  <Quote className="w-6 h-6 text-primary-foreground" />
                </div>

                {/* Category badge */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mb-3 rounded-full text-[10px] font-medium uppercase tracking-wide bg-primary/10 text-primary border border-primary/20 relative z-10">
                  {testimonial.category}
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "text-warning fill-warning drop-shadow"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/90 leading-relaxed mb-6 relative z-10 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 relative z-10 pt-4 border-t border-border/20">
                  <div className={`p-0.5 rounded-full bg-gradient-to-br ${testimonial.gradient}`}>
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-card text-primary font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/10 rounded-br-xl group-hover:border-primary/30 transition-colors duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(TestimonialsSection);
