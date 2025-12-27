import { memo } from "react";
import { Users, FileText, Star, Globe, TrendingUp, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: t("10,000+", "১০,০০০+"),
      label: t("Active Members", "সক্রিয় সদস্য"),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: FileText,
      value: t("50,000+", "৫০,০০০+"),
      label: t("Unity Notes", "ইউনিটি নোটস"),
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Star,
      value: t("4.9", "৪.৯"),
      label: t("Average Rating", "গড় রেটিং"),
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Globe,
      value: t("15+", "১৫+"),
      label: t("Countries", "দেশ থেকে সদস্য"),
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: TrendingUp,
      value: t("500+", "৫০০+"),
      label: t("Daily New Members", "দৈনিক নতুন সদস্য"),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Heart,
      value: t("100K+", "১ লক্ষ+"),
      label: t("Connections Made", "সংযোগ তৈরি হয়েছে"),
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-header mb-4">
            {t("Our Achievements", "আমাদের অর্জন")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("Thousands of people are joining us every day and growing together", "প্রতিদিন হাজারো মানুষ আমাদের সাথে যুক্ত হচ্ছে এবং একসাথে বেড়ে উঠছে")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-card border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(StatsSection);
