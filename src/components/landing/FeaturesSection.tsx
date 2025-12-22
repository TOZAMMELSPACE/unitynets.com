import { Shield, BookOpen, Users, Heart } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "বিশ্বাস / Trust",
    description: "একটি নিরাপদ কমিউনিটি যেখানে প্রতিটি কণ্ঠস্বর শোনা হয় এবং প্রতিটি সদস্যের মূল্য দেওয়া হয়।",
    descriptionEn: "A safe community where every voice is heard and every member is valued.",
    gradient: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: BookOpen,
    title: "শিক্ষা / Learn",
    description: "হাজারো বিনামূল্যে শিক্ষামূলক নোটস এবং দক্ষতা বিনিময়। এখানে শেখা ও শেখানো দুটোই সম্মানের।",
    descriptionEn: "Thousands of free educational notes and skill sharing opportunities.",
    gradient: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: Users,
    title: "ঐক্য / Unite",
    description: "দক্ষিণ এশিয়া থেকে শুরু করে পুরো বিশ্ব জুড়ে একটি ঐক্যবদ্ধ সম্প্রদায় গড়ার স্বপ্ন নিয়ে এগিয়ে যাচ্ছি।",
    descriptionEn: "Building a united community from South Asia to the entire world.",
    gradient: "from-success/20 to-success/5",
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    icon: Heart,
    title: "প্রভাব / Impact",
    description: "দেখুন কিভাবে আমাদের কমিউনিটির মাধ্যমে মানুষের জীবন বদলে যাচ্ছে। সত্যিকারের গল্প, সত্যিকারের পরিবর্তন।",
    descriptionEn: "See real stories of lives changing through our community.",
    gradient: "from-warning/20 to-warning/5",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header text-bengali mb-4">
            কেন আমাদের সাথে যোগ দিবেন? / Why Join Us?
          </h2>
          <p className="text-muted-foreground text-bengali max-w-2xl mx-auto">
            ইউনিটিনেটস শুধু একটি প্ল্যাটফর্ম নয়, এটি একটি পরিবার যেখানে প্রতিটি সদস্য গুরুত্বপূর্ণ
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${feature.gradient} border border-border/30 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden`}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 text-bengali">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-bengali">
                {feature.description}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                {feature.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
