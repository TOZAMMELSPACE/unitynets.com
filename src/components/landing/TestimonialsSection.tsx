import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

export const TestimonialsSection = () => {
  const { t } = useLanguage();

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
    },
    {
      name: t("Fatima Khatun", "ফাতিমা খাতুন"),
      role: t("Graphic Designer", "গ্রাফিক ডিজাইনার"),
      avatar: "",
      quote: t(
        "Sharing my work on this platform got me valuable feedback that helped me improve.",
        "এই প্ল্যাটফর্মে আমি আমার কাজ শেয়ার করে অনেক ফিডব্যাক পেয়েছি যা আমাকে উন্নত করতে সাহায্য করেছে।"
      ),
      rating: 5,
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
    },
    {
      name: t("Sara Begum", "সারা বেগম"),
      role: t("Content Creator", "কন্টেন্ট ক্রিয়েটর"),
      avatar: "",
      quote: t(
        "Sharing my content here gives me so much inspiration. This platform changed my life.",
        "আমার কন্টেন্ট এখানে শেয়ার করে অনেক অনুপ্রেরণা পাই। এই প্ল্যাটফর্ম আমার জীবন বদলে দিয়েছে।"
      ),
      rating: 5,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h2 className="section-header mb-4">
            {t("What Our Members Say", "আমাদের মেম্বাররা কী বলছেন")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Thousands of people are already improving their lives at UnityNets",
              "হাজারো মানুষ ইতিমধ্যে ইউনিটিনেটসে তাদের জীবন উন্নত করছে"
            )}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-card border border-border/30 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(TestimonialsSection);
