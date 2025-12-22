import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "রাহুল আহমেদ",
    role: "সফটওয়্যার ডেভেলপার",
    avatar: "",
    quote: "ইউনিটিনেটসে যোগ দেওয়ার পর আমি অনেক নতুন দক্ষতা শিখেছি। এখানকার মানুষগুলো সত্যিই সাহায্যকারী।",
    quoteEn: "After joining UnityNets, I learned many new skills. The people here are truly helpful.",
    rating: 5,
  },
  {
    name: "ফাতিমা খাতুন",
    role: "গ্রাফিক ডিজাইনার",
    avatar: "",
    quote: "এই প্ল্যাটফর্মে আমি আমার কাজ শেয়ার করে অনেক ফিডব্যাক পেয়েছি যা আমাকে উন্নত করতে সাহায্য করেছে।",
    quoteEn: "Sharing my work on this platform got me valuable feedback that helped me improve.",
    rating: 5,
  },
  {
    name: "আরিফ হাসান",
    role: "উদ্যোক্তা",
    avatar: "",
    quote: "ব্যবসায়িক সংযোগ তৈরি করতে এই প্ল্যাটফর্ম অসাধারণ। এখান থেকেই আমি আমার প্রথম ক্লায়েন্ট পেয়েছি।",
    quoteEn: "This platform is amazing for building business connections. I got my first client from here.",
    rating: 5,
  },
  {
    name: "নুসরাত জাহান",
    role: "শিক্ষার্থী",
    avatar: "",
    quote: "ইউনিটি নোটস থেকে পড়াশোনার জন্য অনেক সহায়ক নোট পেয়েছি। বিনামূল্যে এত কিছু পাওয়া সত্যিই অবিশ্বাস্য।",
    quoteEn: "Unity Notes provided me with so many helpful study materials. Getting all this for free is incredible.",
    rating: 5,
  },
  {
    name: "করিম উদ্দিন",
    role: "ফ্রিল্যান্সার",
    avatar: "",
    quote: "এখানে আমি এমন মানুষদের সাথে পরিচিত হয়েছি যারা আজ আমার ভালো বন্ধু। কমিউনিটিটা সত্যিই আন্তরিক।",
    quoteEn: "I've met people here who are now my good friends. The community is truly genuine.",
    rating: 5,
  },
  {
    name: "সারা বেগম",
    role: "কন্টেন্ট ক্রিয়েটর",
    avatar: "",
    quote: "আমার কন্টেন্ট এখানে শেয়ার করে অনেক অনুপ্রেরণা পাই। এই প্ল্যাটফর্ম আমার জীবন বদলে দিয়েছে।",
    quoteEn: "Sharing my content here gives me so much inspiration. This platform changed my life.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header text-bengali mb-4">
            আমাদের মেম্বাররা কী বলছেন / What Our Members Say
          </h2>
          <p className="text-muted-foreground text-bengali max-w-2xl mx-auto">
            হাজারো মানুষ ইতিমধ্যে ইউনিটিনেটসে তাদের জীবন উন্নত করছে
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-card border border-border/30 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
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
              <p className="text-foreground leading-relaxed mb-4 text-bengali">
                "{testimonial.quote}"
              </p>
              <p className="text-sm text-muted-foreground/70 mb-6 italic">
                "{testimonial.quoteEn}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-bengali">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground text-bengali">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground text-bengali">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
