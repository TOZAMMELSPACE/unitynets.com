import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield, Users, MessageSquare, Lock, AlertTriangle, Scale, Heart, FileText, Globe, Ban, CreditCard, Gavel, Mail, Phone, Clock, Wallet, UserCheck, BadgeCheck, Eye, Database, Bell, Trash2 } from "lucide-react";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Globe,
      titleBn: "১. সেবা গ্রহণের শর্তাবলী",
      titleEn: "1. Terms of Service",
      contentBn: `UnityNets হলো একটি গ্লোবাল প্ল্যাটফর্ম। যেকোনো দেশের মানুষ এখানে যুক্ত হতে পারবেন।

ব্যবহারের শর্তাবলী:
• কমপক্ষে ১৮ বছর বয়স হতে হবে অথবা অভিভাবকের সম্মতি থাকতে হবে
• বিশ্বের যেকোনো দেশ থেকে যুক্ত হতে পারবেন
• সঠিক ও সত্য তথ্য প্রদান করতে হবে
• একটি মাত্র অ্যাকাউন্ট রাখতে পারবেন
• আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখতে হবে
• শক্তিশালী পাসওয়ার্ড ব্যবহার করতে হবে (কমপক্ষে ৬ অক্ষর)
• আপনার লগইন তথ্য অন্য কাউকে শেয়ার করবেন না`,
      contentEn: `UnityNets is a global platform. People from any country can join.

Terms of use:
• Be at least 18 years of age or have parental consent
• You can join from any country in the world
• Provide accurate and truthful information
• Maintain only one account
• Keep your account secure and confidential
• Use a strong password (minimum 6 characters)
• Never share your login credentials with others`
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
• প্ল্যাটফর্মের নিরাপত্তা ব্যাহত করার চেষ্টা করবেন না
• সেবা প্রদানের ক্ষেত্রে সততা বজায় রাখবেন
• অন্যের সাথে বিনয়ী ও সৌজন্যমূলক আচরণ করবেন`,
      contentEn: `While using the platform, you will:
• Show respect towards other users
• Not use false identity or impersonate others
• Not post obscene, offensive, or hateful content
• Not share spam or promotional content
• Not violate intellectual property rights
• Not attempt to breach platform security
• Maintain honesty in service provision
• Treat others with courtesy and politeness`
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
• কপিরাইট লঙ্ঘনকারী উপকরণ
• রাজনৈতিক উস্কানিমূলক পোস্ট
• জাতীয় পতাকা বা প্রতীকের অপমান`,
      contentEn: `You are responsible for the content you post. The following content is prohibited:
• Sexual or obscene material
• Violence or terrorism promotion
• Discrimination based on religion, race, or gender
• Promotion of drugs or illegal goods
• Disclosure of personal information (doxxing)
• Spreading false news or rumors
• Copyright-infringing material
• Politically provocative posts
• Disrespect to national flag or symbols`
    },
    {
      icon: Lock,
      titleBn: "৪. গোপনীয়তা ও তথ্য সুরক্ষা",
      titleEn: "4. Privacy & Data Protection",
      contentBn: `আমরা আপনার গোপনীয়তাকে সম্মান করি:
• আপনার ব্যক্তিগত তথ্য এনক্রিপ্টেড থাকবে
• আমরা আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না
• আপনার ডাটা নিরাপদ সার্ভারে সংরক্ষিত থাকবে
• আপনি যেকোনো সময় আপনার ডাটা ডাউনলোড করতে পারবেন
• আপনি চাইলে আপনার অ্যাকাউন্ট ও সকল ডাটা মুছে ফেলতে পারবেন
• আমরা শুধুমাত্র প্রযোজ্য আইন অনুযায়ী কর্তৃপক্ষকে তথ্য প্রদান করি
• আপনার ফোন নম্বর ও ইমেইল গোপন রাখা হবে
• শুধুমাত্র আপনার অনুমতিতে আপনার অবস্থান শেয়ার করা হবে`,
      contentEn: `We respect your privacy:
• Your personal data will be encrypted
• We do not sell your data to third parties
• Your data is stored in secure servers
• You can download your data at any time
• You can delete your account and all data if desired
• We only share information with authorities as required by law
• Your phone number and email will be kept private
• Your location will only be shared with your permission`
    },
    {
      icon: Wallet,
      titleBn: "৫. Unity Note সিস্টেম",
      titleEn: "5. Unity Note System",
      contentBn: `Unity Note হলো আমাদের সময়-ভিত্তিক মুদ্রা ব্যবস্থা:
• ১ ঘণ্টা সেবা = ১ Unity Note
• Unity Note আসল টাকায় রূপান্তরযোগ্য নয়
• জালিয়াতি বা অপব্যবহার করলে অ্যাকাউন্ট বন্ধ হবে
• সেবার মান নিয়ন্ত্রণ আপনার দায়িত্ব
• বিরোধ নিষ্পত্তিতে UnityNets চূড়ান্ত সিদ্ধান্ত নেবে
• Unity Note অর্জনে প্রতারণা করলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ
• Unity Note অন্যকে বিক্রি বা হস্তান্তর করা যাবে না
• সেবা গ্রহণের পর সঠিক রেটিং প্রদান করুন`,
      contentEn: `Unity Note is our time-based currency system:
• 1 hour of service = 1 Unity Note
• Unity Notes cannot be converted to real money
• Fraud or misuse will result in account suspension
• Quality of service is your responsibility
• UnityNets will make final decisions in disputes
• Account will be permanently suspended for earning fraud
• Unity Notes cannot be sold or transferred to others
• Provide honest ratings after receiving services`
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
• হয়রানি, হুমকি বা ব্ল্যাকমেইল
• ফিশিং বা পরিচয় চুরি
• মাল্টিপল অ্যাকাউন্ট তৈরি করা
• সেবা প্রদানে প্রতারণা`,
      contentEn: `The following activities are strictly prohibited:
• Hacking or cyber attacks
• Spreading viruses or malware
• Unauthorized access to others' accounts
• Using bots or automated systems
• Platform scraping or data theft
• Financial fraud or scams
• Harassment, threats, or blackmail
• Phishing or identity theft
• Creating multiple accounts
• Service provision fraud`
    },
    {
      icon: UserCheck,
      titleBn: "৭. ভেরিফিকেশন ও Trust Score",
      titleEn: "7. Verification & Trust Score",
      contentBn: `আপনার বিশ্বাসযোগ্যতা বাড়াতে:
• NID দিয়ে পরিচয় যাচাই করুন
• মোবাইল নম্বর যাচাই করুন
• প্রোফাইল ছবি যোগ করুন
• সেবা প্রদানে সক্রিয় থাকুন
• ইতিবাচক রেটিং অর্জন করুন
• সম্প্রদায়ে অবদান রাখুন
• Trust Score বাড়লে আরো সুবিধা পাবেন
• জাল ভেরিফিকেশন করলে অ্যাকাউন্ট বন্ধ হবে`,
      contentEn: `To increase your trustworthiness:
• Verify identity with NID
• Verify your mobile number
• Add a profile picture
• Stay active in service provision
• Earn positive ratings
• Contribute to the community
• Higher Trust Score unlocks more benefits
• Fake verification will result in account suspension`
    },
    {
      icon: Bell,
      titleBn: "৮. যোগাযোগ ও নোটিফিকেশন",
      titleEn: "8. Communication & Notifications",
      contentBn: `যোগাযোগ সংক্রান্ত নীতি:
• আমরা গুরুত্বপূর্ণ আপডেট ইমেইল/SMS করতে পারি
• আপনি নোটিফিকেশন সেটিংস পরিবর্তন করতে পারবেন
• বার্তায় অনুচিত ভাষা ব্যবহার করবেন না
• অন্যদের অনুমতি ছাড়া মার্কেটিং বার্তা পাঠাবেন না
• প্ল্যাটফর্মের বাইরে যোগাযোগে আমরা দায়ী নই
• স্প্যাম বার্তা পাঠালে অ্যাকাউন্ট সীমিত হতে পারে`,
      contentEn: `Communication policies:
• We may send important updates via email/SMS
• You can change your notification settings
• Do not use inappropriate language in messages
• Do not send marketing messages without permission
• We are not responsible for off-platform communication
• Sending spam messages may result in account restrictions`
    },
    {
      icon: Scale,
      titleBn: "৯. বিরোধ নিষ্পত্তি",
      titleEn: "9. Dispute Resolution",
      contentBn: `বিরোধের ক্ষেত্রে:
• প্রথমে সরাসরি আলোচনার মাধ্যমে সমাধানের চেষ্টা করুন
• সমাধান না হলে UnityNets সাপোর্টে যোগাযোগ করুন
• আমরা ৭ কার্যদিবসের মধ্যে সাড়া দেওয়ার চেষ্টা করব
• প্রমাণ ছাড়া অভিযোগ গ্রহণযোগ্য নয়
• মিথ্যা অভিযোগ করলে অভিযোগকারীর বিরুদ্ধে ব্যবস্থা নেওয়া হবে
• চূড়ান্ত সিদ্ধান্ত UnityNets-এর এবং এটি বাধ্যতামূলক`,
      contentEn: `In case of disputes:
• First try to resolve through direct discussion
• If unresolved, contact UnityNets support
• We will try to respond within 7 business days
• Complaints without evidence are not acceptable
• False accusations will result in action against complainant
• UnityNets' final decision is binding`
    },
    {
      icon: Gavel,
      titleBn: "১০. আইনি বিষয়াবলী",
      titleEn: "10. Legal Matters",
      contentBn: `• এই শর্তাবলী বাংলাদেশের আইন দ্বারা পরিচালিত
• যেকোনো বিরোধ ঢাকার আদালতে নিষ্পত্তি হবে
• UnityNets যেকোনো সময় শর্তাবলী পরিবর্তন করতে পারে
• গুরুত্বপূর্ণ পরিবর্তন হলে আপনাকে জানানো হবে
• শর্তাবলী ভঙ্গ করলে অ্যাকাউন্ট স্থগিত বা বন্ধ হতে পারে
• আমরা কোনো পূর্ব নোটিশ ছাড়াই সেবা বন্ধ করার অধিকার রাখি
• এই প্ল্যাটফর্ম ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন`,
      contentEn: `• These terms are governed by the laws of Bangladesh
• Any disputes will be resolved in Dhaka courts
• UnityNets may modify terms at any time
• You will be notified of significant changes
• Violation of terms may result in account suspension
• We reserve the right to discontinue service without notice
• By using this platform, you agree to these terms`
    },
    {
      icon: Shield,
      titleBn: "১১. দায়বদ্ধতার সীমাবদ্ধতা",
      titleEn: "11. Limitation of Liability",
      contentBn: `• UnityNets কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য দায়ী নয়
• ব্যবহারকারীদের মধ্যে লেনদেনের দায় UnityNets বহন করে না
• প্ল্যাটফর্ম "যেমন আছে" ভিত্তিতে প্রদান করা হয়
• আমরা নিরবচ্ছিন্ন সেবার নিশ্চয়তা দিই না
• তৃতীয় পক্ষের লিংক বা কনটেন্টের জন্য আমরা দায়ী নই
• প্রাকৃতিক দুর্যোগ বা অনিয়ন্ত্রিত ঘটনার জন্য দায়ী নই
• সার্ভার ডাউনটাইমের জন্য ক্ষতিপূরণ প্রযোজ্য নয়`,
      contentEn: `• UnityNets is not liable for any direct or indirect damages
• UnityNets does not bear responsibility for user transactions
• The platform is provided on an "as is" basis
• We do not guarantee uninterrupted service
• We are not responsible for third-party links or content
• Not liable for natural disasters or uncontrolled events
• No compensation applies for server downtime`
    },
    {
      icon: Trash2,
      titleBn: "১২. অ্যাকাউন্ট বন্ধ ও মুছে ফেলা",
      titleEn: "12. Account Suspension & Deletion",
      contentBn: `অ্যাকাউন্ট সংক্রান্ত নীতি:
• আপনি যেকোনো সময় অ্যাকাউন্ট মুছে ফেলতে পারবেন
• শর্ত ভঙ্গ করলে অ্যাকাউন্ট স্থগিত বা বন্ধ হতে পারে
• বন্ধ অ্যাকাউন্টের ডাটা ৩০ দিন পর মুছে ফেলা হবে
• পুনরায় নিবন্ধন নিষিদ্ধ হতে পারে গুরুতর অপরাধে
• অ্যাকাউন্ট মুছলে Unity Notes হারিয়ে যাবে
• সক্রিয় বিরোধ থাকলে অ্যাকাউন্ট মুছতে পারবেন না`,
      contentEn: `Account policies:
• You can delete your account at any time
• Accounts may be suspended or terminated for violations
• Terminated account data will be deleted after 30 days
• Re-registration may be prohibited for serious offenses
• Unity Notes will be lost upon account deletion
• Cannot delete account with active disputes`
    },
    {
      icon: Database,
      titleBn: "১৩. তথ্য সংরক্ষণ নীতি",
      titleEn: "13. Data Retention Policy",
      contentBn: `আমরা যে তথ্য সংরক্ষণ করি:
• প্রোফাইল তথ্য: অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত
• পোস্ট ও মন্তব্য: মুছে না ফেলা পর্যন্ত
• বার্তা: ১ বছর পর স্বয়ংক্রিয় মুছে যাবে
• লগ ফাইল: ৬ মাস পর্যন্ত
• লেনদেন রেকর্ড: ৫ বছর পর্যন্ত (আইনি প্রয়োজনে)
• ব্যাকআপ ডাটা: ৯০ দিন পর মুছে ফেলা হয়`,
      contentEn: `Data we retain:
• Profile information: Until account is active
• Posts and comments: Until deleted
• Messages: Automatically deleted after 1 year
• Log files: Up to 6 months
• Transaction records: Up to 5 years (legal requirements)
• Backup data: Deleted after 90 days`
    },
    {
      icon: Globe,
      titleBn: "১৪. আন্তর্জাতিক ব্যবহার",
      titleEn: "14. International Usage",
      contentBn: `বিদেশ থেকে ব্যবহারে:
• এই প্ল্যাটফর্ম প্রাথমিকভাবে বাংলাদেশের জন্য
• বিদেশ থেকে ব্যবহারে স্থানীয় আইন মেনে চলুন
• VPN ব্যবহারে সীমাবদ্ধতা থাকতে পারে
• কিছু সেবা শুধুমাত্র বাংলাদেশে প্রযোজ্য
• বিভিন্ন দেশে বিভিন্ন নিয়ম প্রযোজ্য হতে পারে`,
      contentEn: `For usage from abroad:
• This platform is primarily for Bangladesh
• Follow local laws when using from abroad
• VPN usage may have restrictions
• Some services only apply in Bangladesh
• Different rules may apply in different countries`
    },
    {
      icon: Eye,
      titleBn: "১৫. গোপনীয়তা নীতি (Privacy Policy)",
      titleEn: "15. Privacy Policy",
      contentBn: `আমাদের গোপনীয়তা নীতি:

📊 তথ্য সংগ্রহ:
• নাম, ইমেইল, ফোন নম্বর (রেজিস্ট্রেশনের জন্য)
• প্রোফাইল ছবি ও বায়ো (আপনার দেওয়া)
• IP ঠিকানা ও ডিভাইসের তথ্য
• ব্রাউজার ধরন ও অপারেটিং সিস্টেম
• কুকিজ ও সেশন ডাটা
• ব্যবহারের প্যাটার্ন ও পরিসংখ্যান

🎯 তথ্য ব্যবহার:
• আপনার অ্যাকাউন্ট পরিচালনা
• সেবা উন্নতি ও ব্যক্তিগতকরণ
• নিরাপত্তা ও জালিয়াতি প্রতিরোধ
• বিজ্ঞাপন প্রদর্শন (Ezoic, Google AdSense)
• বিশ্লেষণ ও পরিসংখ্যান (Analytics)

🔐 তথ্য সুরক্ষা:
• SSL/TLS এনক্রিপশন
• নিয়মিত নিরাপত্তা অডিট
• সীমিত কর্মী প্রবেশাধিকার

🍪 কুকিজ ও বিজ্ঞাপন:
• আমরা Ezoic ও Google AdSense ব্যবহার করি
• তৃতীয় পক্ষ কুকিজ ব্যবহার করতে পারে
• আপনি ব্রাউজার সেটিংস থেকে কুকি নিয়ন্ত্রণ করতে পারেন

✋ আপনার অধিকার:
• তথ্য দেখা ও ডাউনলোড করা
• তথ্য সংশোধন করা
• অ্যাকাউন্ট মুছে ফেলা
• মার্কেটিং থেকে প্রত্যাহার`,
      contentEn: `Our Privacy Policy:

📊 Information We Collect:
• Name, email, phone number (for registration)
• Profile photo and bio (provided by you)
• IP address and device information
• Browser type and operating system
• Cookies and session data
• Usage patterns and statistics

🎯 How We Use Information:
• Managing your account
• Improving and personalizing services
• Security and fraud prevention
• Displaying advertisements (Ezoic, Google AdSense)
• Analytics and statistics

🔐 Data Protection:
• SSL/TLS encryption
• Regular security audits
• Limited staff access

🍪 Cookies & Advertising:
• We use Ezoic and Google AdSense for advertising
• Third parties may use cookies for ad personalization
• You can control cookies through browser settings
• We partner with ad networks that may collect data for targeted advertising

✋ Your Rights:
• View and download your data
• Correct your information
• Delete your account
• Opt-out of marketing communications

📍 Third-Party Services:
• Google Analytics for website analytics
• Ezoic for ad optimization and analytics
• These services may collect data according to their own privacy policies

For more information about how our ad partners use your data:
• Google Privacy Policy: https://policies.google.com/privacy
• Ezoic Privacy Policy: https://www.ezoic.com/privacy-policy/`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold">শর্তাবলী ও নীতিমালা</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Terms & Conditions</p>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-60px)] sm:h-[calc(100vh-73px)]">
        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Introduction */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-5 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  UnityNets নীতিমালা
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Terms, Privacy & Guidelines</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              🤝 UnityNets হলো বাংলাদেশের একটি বিশ্বস্ত সামাজিক প্ল্যাটফর্ম যেখানে মানুষ একে অপরকে সাহায্য করে, শেখে এবং একত্রে শক্তিশালী হয়। আমরা বিশ্বাস করি প্রতিটি মানুষের সময় সমান মূল্যবান।
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
              Welcome to UnityNets - a trusted social platform of Bangladesh where people help each other, learn together, and grow stronger as a community. We believe every person's time has equal value.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-primary/10">
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">১৫</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Sections</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">২</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Languages</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">১০০%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Transparent</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">24/7</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Support</p>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 border-t border-primary/10">
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                সর্বশেষ আপডেট: ডিসেম্বর ২০২৪ | Last Updated: December 2024
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mb-6 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              দ্রুত নেভিগেশন / Quick Navigation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sections.map((section, index) => (
                <button 
                  key={index}
                  onClick={() => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[10px] sm:text-xs text-left p-2 bg-background/50 hover:bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-colors truncate"
                >
                  {section.titleBn.split(' ').slice(1).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-4 sm:space-y-6">
            {sections.map((section, index) => (
              <div 
                key={index}
                id={`section-${index}`}
                className="p-3 sm:p-5 bg-card rounded-xl border border-border scroll-mt-20"
              >
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <section.icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">
                      {section.titleBn}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {section.titleEn}
                    </p>
                  </div>
                </div>
                
                {/* Bengali Content */}
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-primary font-medium mb-1.5 sm:mb-2 flex items-center gap-1">
                    🇧🇩 বাংলা
                  </p>
                  <p className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {section.contentBn}
                  </p>
                </div>
                
                {/* English Content */}
                <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-primary font-medium mb-1.5 sm:mb-2 flex items-center gap-1">
                    🇬🇧 English
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.contentEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Agreement Section */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-primary/5 rounded-xl border border-primary/10 text-center">
            <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <BadgeCheck className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-2">সম্মতি প্রদান / Agreement</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 max-w-lg mx-auto">
              UnityNets-এ নিবন্ধন করার মাধ্যমে আপনি উপরের সকল শর্তাবলী পড়েছেন এবং মেনে নিতে সম্মত হয়েছেন বলে গণ্য হবে।
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-4 max-w-lg mx-auto">
              By registering on UnityNets, you acknowledge that you have read and agree to all the terms and conditions stated above.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 sm:px-8">
              <BadgeCheck className="w-4 h-4 mr-2" />
              আমি সম্মত আছি / I Agree
            </Button>
          </div>

          {/* Contact */}
          <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-sm font-semibold text-center mb-3">যোগাযোগ করুন / Contact Us</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-primary">support@unitynets.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">+880 1XXX-XXXXXX</span>
              </div>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-3">
              আমরা ৭ কার্যদিবসের মধ্যে উত্তর দেওয়ার চেষ্টা করি
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center pb-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              © 2025 UnityNets. সর্বস্বত্ব সংরক্ষিত | All rights reserved.
            </p>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
};

export default TermsAndConditions;