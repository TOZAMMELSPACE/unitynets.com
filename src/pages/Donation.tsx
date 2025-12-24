import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Gift, Users, Globe, ArrowLeft, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Donation = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const donationAmounts = [100, 500, 1000, 5000];

  const paymentMethods = [
    {
      name: "bKash",
      number: "01XXXXXXXXX",
      type: "personal",
    },
    {
      name: "Nagad",
      number: "01XXXXXXXXX",
      type: "personal",
    },
    {
      name: "Rocket",
      number: "01XXXXXXXXX",
      type: "personal",
    },
  ];

  const impactItems = [
    {
      icon: Users,
      title: t("Community Support", "সম্প্রদায় সহায়তা"),
      description: t(
        "Help us reach more communities across Bangladesh",
        "বাংলাদেশ জুড়ে আরো সম্প্রদায়ে পৌঁছাতে সাহায্য করুন"
      ),
    },
    {
      icon: Globe,
      title: t("Platform Development", "প্ল্যাটফর্ম উন্নয়ন"),
      description: t(
        "Improve our platform with new features",
        "নতুন বৈশিষ্ট্য দিয়ে আমাদের প্ল্যাটফর্ম উন্নত করুন"
      ),
    },
    {
      icon: Gift,
      title: t("Educational Resources", "শিক্ষামূলক সম্পদ"),
      description: t(
        "Create free learning materials for everyone",
        "সকলের জন্য বিনামূল্যে শিক্ষামূলক উপকরণ তৈরি করুন"
      ),
    },
  ];

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    toast.success(t(`${name} number copied!`, `${name} নম্বর কপি হয়েছে!`));
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Home", "হোমে ফিরুন")}
          </Link>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("Support UnityNets", "ইউনিটিনেটস সাপোর্ট করুন")}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t(
                "Your generous donation helps us build a stronger, more connected community. Every contribution makes a difference in creating positive change.",
                "আপনার উদার দান আমাদের একটি শক্তিশালী, আরও সংযুক্ত সম্প্রদায় গড়তে সাহায্য করে। প্রতিটি অবদান ইতিবাচক পরিবর্তন তৈরিতে ভূমিকা রাখে।"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Impact & Payment */}
          <div className="space-y-8">
            {/* Impact Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Your Impact", "আপনার প্রভাব")}</CardTitle>
                <CardDescription>
                  {t(
                    "See how your donation helps our community",
                    "দেখুন কিভাবে আপনার দান আমাদের সম্প্রদায়কে সাহায্য করে"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {impactItems.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Amounts */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Suggested Amounts", "প্রস্তাবিত পরিমাণ")}</CardTitle>
                <CardDescription>
                  {t(
                    "Choose an amount or donate any amount you prefer",
                    "একটি পরিমাণ বাছাই করুন অথবা আপনার পছন্দমতো দান করুন"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {donationAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="h-14 text-lg font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      ৳{amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Payment Methods", "পেমেন্ট পদ্ধতি")}</CardTitle>
                <CardDescription>
                  {t(
                    "Send your donation via any of these methods",
                    "এই পদ্ধতিগুলোর যেকোনো একটি দিয়ে আপনার দান পাঠান"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">{method.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{method.number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(method.number, method.name)}
                    >
                      {copied === method.name ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground text-center pt-2">
                  {t(
                    "After sending, please fill out the form to let us know about your donation.",
                    "পাঠানোর পর, আপনার দান সম্পর্কে আমাদের জানাতে ফর্মটি পূরণ করুন।"
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("Donation Details", "দানের বিবরণ")}</CardTitle>
                <CardDescription>
                  {t(
                    "Let us know about your contribution",
                    "আপনার অবদান সম্পর্কে আমাদের জানান"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("Your Name", "আপনার নাম")}</Label>
                    <Input
                      id="name"
                      placeholder={t("Enter your name", "আপনার নাম লিখুন")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("Email Address", "ইমেইল")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("Enter your email", "আপনার ইমেইল লিখুন")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("Donation Amount (৳)", "দানের পরিমাণ (৳)")}</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={t("Enter amount", "পরিমাণ লিখুন")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionId">{t("Transaction ID", "ট্রানজেকশন আইডি")}</Label>
                    <Input
                      id="transactionId"
                      placeholder={t("Enter transaction ID from payment", "পেমেন্ট থেকে ট্রানজেকশন আইডি লিখুন")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("Message (Optional)", "মেসেজ (ঐচ্ছিক)")}</Label>
                    <Textarea
                      id="message"
                      placeholder={t("Share a message with us...", "আমাদের সাথে একটি মেসেজ শেয়ার করুন...")}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full h-12">
                    <Heart className="w-5 h-5 mr-2" />
                    {t("Confirm Donation", "দান নিশ্চিত করুন")}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {t(
                      "By donating, you agree to our terms and conditions. Your information is secure and private.",
                      "দান করে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন। আপনার তথ্য সুরক্ষিত এবং গোপনীয়।"
                    )}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;
