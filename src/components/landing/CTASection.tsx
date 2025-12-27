import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const CTASection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>{t("Start Today - Completely Free", "আজই শুরু করুন - সম্পূর্ণ বিনামূল্যে")}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t("Be Part of Our Dream Now", "এখনই অংশ হোন আমাদের স্বপ্নের")}
            <span className="block text-white/80 text-xl md:text-2xl mt-2 font-normal">
              {t("From South Asia to the World", "দক্ষিণ এশিয়া থেকে সারা বিশ্ব")}
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t(
              "From South Asia to the whole world — we want to unite everyone. Your participation will help make our dream a reality.",
              "দক্ষিণ এশিয়া থেকে সারা বিশ্ব — আমরা সবাইকে একত্রিত করতে চাই। আপনার অংশগ্রহণ আমাদের স্বপ্নকে বাস্তব করতে সাহায্য করবে।"
            )}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl group shadow-xl"
              onClick={() => navigate('/auth?mode=signup')}
            >
              <span>{t("Register Free", "ফ্রি রেজিস্ট্রেশন করুন")}</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl bg-transparent"
              onClick={() => navigate('/about')}
            >
              <span>{t("Learn Our Mission", "আমাদের মিশন জানুন")}</span>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-white/80">
              <Users className="w-5 h-5" />
              <span>{t("10,000+ Active Members", "১০,০০০+ সক্রিয় সদস্য")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Globe className="w-5 h-5" />
              <span>{t("From 15+ Countries", "১৫+ দেশ থেকে")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="w-5 h-5" />
              <span>{t("100% Free", "১০০% বিনামূল্যে")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(CTASection);
