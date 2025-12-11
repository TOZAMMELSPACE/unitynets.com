import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield, Users, MessageSquare, Lock, AlertTriangle, Scale, Heart } from "lucide-react";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Shield,
      titleBn: "১. সেবা গ্রহণের শর্তাবলী",
      titleEn: "1. Terms of Service",
      contentBn: `UnityNet প্ল্যাটফর্ম ব্যবহার করতে হলে আপনাকে অবশ্যই:
• কমপক্ষে ১৮ বছর বয়স হতে হবে
• বাংলাদেশের নাগরিক হতে হবে অথবা বৈধ ভিসাধারী হতে হবে
• সঠিক ও সত্য তথ্য প্রদান করতে হবে
• একটি মাত্র অ্যাকাউন্ট রাখতে পারবেন
• আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখতে হবে`,
      contentEn: `To use the UnityNet platform, you must:
• Be at least 18 years of age
• Be a citizen of Bangladesh or hold a valid visa
• Provide accurate and truthful information
• Maintain only one account
• Keep your account secure and confidential`
    },
    {
      icon: Users,
      titleBn: "২. ব্যবহারকারীর দায়িত্ব",
      titleEn: "2. User Responsibilities",
      contentBn: `প্ল্যাটফর্ম ব্যবহারের সময় আপনি:
• অন্যদের প্রতি সম্মান প্রদর্শন করবেন
• মিথ্যা পরিচয় ব্যবহার করবেন না
• অশ্লীল, আপত্তিকর বা ঘৃণামূলক কনটেন্ট পোস্ট করবেন না
• স্প্যাম বা বিজ্ঞাপনমূলক কনটেন্ট শেয়ার করবেন না
• অন্যের মেধাস্বত্ব লঙ্ঘন করবেন না
• প্ল্যাটফর্মের নিরাপত্তা ব্যাহত করার চেষ্টা করবেন না`,
      contentEn: `While using the platform, you will:
• Show respect towards other users
• Not use false identity or impersonate others
• Not post obscene, offensive, or hateful content
• Not share spam or promotional content
• Not violate intellectual property rights
• Not attempt to breach platform security`
    },
    {
      icon: MessageSquare,
      titleBn: "৩. কনটেন্ট নীতিমালা",
      titleEn: "3. Content Policy",
      contentBn: `আপনি যে কনটেন্ট পোস্ট করবেন তার জন্য আপনি দায়ী। নিম্নলিখিত কনটেন্ট নিষিদ্ধ:
• যৌন বা অশ্লীল উপকরণ
• সহিংসতা বা সন্ত্রাসবাদ প্রচার
• ধর্ম, জাতি বা লিঙ্গ ভিত্তিক বৈষম্য
• মাদকদ্রব্য বা অবৈধ পণ্যের প্রচার
• ব্যক্তিগত তথ্য প্রকাশ (ডক্সিং)
• মিথ্যা সংবাদ বা গুজব ছড়ানো
• কপিরাইট লঙ্ঘনকারী উপকরণ`,
      contentEn: `You are responsible for the content you post. The following content is prohibited:
• Sexual or obscene material
• Violence or terrorism promotion
• Discrimination based on religion, race, or gender
• Promotion of drugs or illegal goods
• Disclosure of personal information (doxxing)
• Spreading false news or rumors
• Copyright-infringing material`
    },
    {
      icon: Lock,
      titleBn: "৪. গোপনীয়তা ও তথ্য সুরক্ষা",
      titleEn: "4. Privacy & Data Protection",
      contentBn: `আমরা আপনার গোপনীয়তাকে সম্মান করি:
• আপনার ব্যক্তিগত তথ্য এনক্রিপ্টেড থাকবে
• আমরা আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না
• আপনার ডাটা বাংলাদেশে নিরাপদ সার্ভারে সংরক্ষিত থাকবে
• আপনি যেকোনো সময় আপনার ডাটা ডাউনলোড করতে পারবেন
• আপনি চাইলে আপনার অ্যাকাউন্ট ও সকল ডাটা মুছে ফেলতে পারবেন
• আমরা শুধুমাত্র প্রযোজ্য আইন অনুযায়ী কর্তৃপক্ষকে তথ্য প্রদান করি`,
      contentEn: `We respect your privacy:
• Your personal data will be encrypted
• We do not sell your data to third parties
• Your data is stored in secure servers in Bangladesh
• You can download your data at any time
• You can delete your account and all data if desired
• We only share information with authorities as required by law`
    },
    {
      icon: Heart,
      titleBn: "৫. Unity Note সিস্টেম",
      titleEn: "5. Unity Note System",
      contentBn: `Unity Note হলো আমাদের সময়-ভিত্তিক মুদ্রা ব্যবস্থা:
• ১ ঘণ্টা সেবা = ১ Unity Note
• Unity Note আসল টাকায় রূপান্তরযোগ্য নয়
• জালিয়াতি বা অপব্যবহার করলে অ্যাকাউন্ট বন্ধ হবে
• সেবার মান নিয়ন্ত্রণ আপনার দায়িত্ব
• বিরোধ নিষ্পত্তিতে UnityNet চূড়ান্ত সিদ্ধান্ত নেবে`,
      contentEn: `Unity Note is our time-based currency system:
• 1 hour of service = 1 Unity Note
• Unity Notes cannot be converted to real money
• Fraud or misuse will result in account suspension
• Quality of service is your responsibility
• UnityNet will make final decisions in disputes`
    },
    {
      icon: AlertTriangle,
      titleBn: "৬. নিষিদ্ধ কার্যকলাপ",
      titleEn: "6. Prohibited Activities",
      contentBn: `নিম্নলিখিত কার্যকলাপ সম্পূর্ণ নিষিদ্ধ:
• হ্যাকিং বা সাইবার আক্রমণ
• ভাইরাস বা ম্যালওয়্যার ছড়ানো
• অন্যের অ্যাকাউন্টে অননুমোদিত প্রবেশ
• বট বা স্বয়ংক্রিয় সিস্টেম ব্যবহার
• প্ল্যাটফর্ম স্ক্র্যাপিং বা ডাটা চুরি
• আর্থিক প্রতারণা বা স্ক্যাম
• হয়রানি, হুমকি বা ব্ল্যাকমেইল`,
      contentEn: `The following activities are strictly prohibited:
• Hacking or cyber attacks
• Spreading viruses or malware
• Unauthorized access to others' accounts
• Using bots or automated systems
• Platform scraping or data theft
• Financial fraud or scams
• Harassment, threats, or blackmail`
    },
    {
      icon: Scale,
      titleBn: "৭. আইনি বিষয়াবলী",
      titleEn: "7. Legal Matters",
      contentBn: `• এই শর্তাবলী বাংলাদেশের আইন দ্বারা পরিচালিত
• যেকোনো বিরোধ ঢাকার আদালতে নিষ্পত্তি হবে
• UnityNet যেকোনো সময় শর্তাবলী পরিবর্তন করতে পারে
• গুরুত্বপূর্ণ পরিবর্তন হলে আপনাকে জানানো হবে
• শর্তাবলী ভঙ্গ করলে অ্যাকাউন্ট স্থগিত বা বন্ধ হতে পারে
• আমরা কোনো পূর্ব নোটিশ ছাড়াই সেবা বন্ধ করার অধিকার রাখি`,
      contentEn: `• These terms are governed by the laws of Bangladesh
• Any disputes will be resolved in Dhaka courts
• UnityNet may modify terms at any time
• You will be notified of significant changes
• Violation of terms may result in account suspension
• We reserve the right to discontinue service without notice`
    },
    {
      icon: Shield,
      titleBn: "৮. দায়বদ্ধতার সীমাবদ্ধতা",
      titleEn: "8. Limitation of Liability",
      contentBn: `• UnityNet কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য দায়ী নয়
• ব্যবহারকারীদের মধ্যে লেনদেনের দায় UnityNet বহন করে না
• প্ল্যাটফর্ম "যেমন আছে" ভিত্তিতে প্রদান করা হয়
• আমরা নিরবচ্ছিন্ন সেবার নিশ্চয়তা দিই না
• তৃতীয় পক্ষের লিংক বা কনটেন্টের জন্য আমরা দায়ী নই`,
      contentEn: `• UnityNet is not liable for any direct or indirect damages
• UnityNet does not bear responsibility for user transactions
• The platform is provided on an "as is" basis
• We do not guarantee uninterrupted service
• We are not responsible for third-party links or content`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">শর্তাবলী ও নীতিমালা</h1>
            <p className="text-xs text-muted-foreground">Terms & Conditions</p>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Introduction */}
          <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <h2 className="text-lg font-semibold mb-2">
              🤝 UnityNet-এ স্বাগতম
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              UnityNet হলো বাংলাদেশের একটি বিশ্বস্ত সামাজিক প্ল্যাটফর্ম যেখানে মানুষ একে অপরকে সাহায্য করে, শেখে এবং একত্রে শক্তিশালী হয়।
            </p>
            <p className="text-sm text-muted-foreground">
              Welcome to UnityNet - a trusted social platform of Bangladesh where people help each other, learn together, and grow stronger as a community.
            </p>
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-xs text-muted-foreground">
                📅 সর্বশেষ আপডেট: ডিসেম্বর ২০২৪ | Last Updated: December 2024
              </p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {section.titleBn}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {section.titleEn}
                    </p>
                  </div>
                </div>
                
                {/* Bengali Content */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-primary font-medium mb-2">বাংলা</p>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {section.contentBn}
                  </p>
                </div>
                
                {/* English Content */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-primary font-medium mb-2">English</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.contentEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Agreement Section */}
          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 text-center">
            <Shield className="w-10 h-10 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">সম্মতি প্রদান</h3>
            <p className="text-sm text-muted-foreground mb-4">
              UnityNet-এ নিবন্ধন করার মাধ্যমে আপনি উপরের সকল শর্তাবলী পড়েছেন এবং মেনে নিতে সম্মত হয়েছেন বলে গণ্য হবে।
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              By registering on UnityNet, you acknowledge that you have read and agree to all the terms and conditions stated above.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full sm:w-auto">
              আমি সম্মত আছি / I Agree
            </Button>
          </div>

          {/* Contact */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>প্রশ্ন থাকলে যোগাযোগ করুন:</p>
            <p className="text-primary">support@unitynet.com.bd</p>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
};

export default TermsAndConditions;
