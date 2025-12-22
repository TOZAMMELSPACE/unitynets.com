import { Users, FileText, Star, Globe, TrendingUp, Heart } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "১০,০০০+",
    label: "সক্রিয় সদস্য",
    labelEn: "Active Members",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: FileText,
    value: "৫০,০০০+",
    label: "ইউনিটি নোটস",
    labelEn: "Unity Notes",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Star,
    value: "৪.৯",
    label: "গড় রেটিং",
    labelEn: "Average Rating",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Globe,
    value: "১৫+",
    label: "দেশ থেকে সদস্য",
    labelEn: "Countries",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: TrendingUp,
    value: "৫০০+",
    label: "দৈনিক নতুন সদস্য",
    labelEn: "Daily New Members",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Heart,
    value: "১ লক্ষ+",
    label: "সংযোগ তৈরি হয়েছে",
    labelEn: "Connections Made",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

export const StatsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-header text-bengali mb-4">
            আমাদের অর্জন / Our Achievements
          </h2>
          <p className="text-muted-foreground text-bengali max-w-2xl mx-auto">
            প্রতিদিন হাজারো মানুষ আমাদের সাথে যুক্ত হচ্ছে এবং একসাথে বেড়ে উঠছে
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
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1 text-bengali`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground text-bengali">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">
                {stat.labelEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
