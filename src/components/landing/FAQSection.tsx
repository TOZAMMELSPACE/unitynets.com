import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQSection = () => {
  const { language } = useLanguage();

  const faqs = [
    {
      question: language === 'bn' ? "UnityNets কি বিনামূল্যে?" : "Is UnityNets free to use?",
      answer: language === 'bn' 
        ? "হ্যাঁ, UnityNets সম্পূর্ণ বিনামূল্যে। আপনি বিনা খরচে প্রোফাইল তৈরি করতে, কমিউনিটিতে যোগ দিতে এবং Unity Notes উপার্জন করতে পারবেন।"
        : "Yes, UnityNets is completely free to use. You can create a profile, join communities, and earn Unity Notes at no cost."
    },
    {
      question: language === 'bn' ? "Unity Notes কি?" : "What are Unity Notes?",
      answer: language === 'bn'
        ? "Unity Notes হলো আমাদের কমিউনিটি পয়েন্ট সিস্টেম। আপনি অন্যদের সাহায্য করে, জ্ঞান শেয়ার করে এবং কমিউনিটি কার্যক্রমে অংশগ্রহণ করে Unity Notes উপার্জন করতে পারেন। এগুলো সেবা বিনিময়ে ব্যবহার করা যায়।"
        : "Unity Notes are our community point system. You can earn them by helping others, sharing knowledge, and participating in community activities. They can be used to exchange services within the community."
    },
    {
      question: language === 'bn' ? "আমার তথ্য কি নিরাপদ?" : "Is my data safe and private?",
      answer: language === 'bn'
        ? "হ্যাঁ, আপনার গোপনীয়তা আমাদের কাছে সর্বোচ্চ গুরুত্বপূর্ণ। আমরা আধুনিক নিরাপত্তা ব্যবস্থা ব্যবহার করি এবং আপনার ব্যক্তিগত তথ্য কখনো তৃতীয় পক্ষের কাছে বিক্রি করি না।"
        : "Yes, your privacy is our top priority. We use modern security measures and never sell your personal information to third parties."
    },
    {
      question: language === 'bn' ? "কিভাবে কমিউনিটিতে যোগ দিব?" : "How do I join a community?",
      answer: language === 'bn'
        ? "প্রথমে একটি অ্যাকাউন্ট তৈরি করুন, তারপর আপনার এলাকা বা আগ্রহের বিষয় অনুযায়ী কমিউনিটি খুঁজুন। 'যোগ দিন' বোতামে ক্লিক করলেই আপনি সদস্য হয়ে যাবেন।"
        : "First create an account, then browse communities based on your location or interests. Click the 'Join' button to become a member instantly."
    },
    {
      question: language === 'bn' ? "Trust Score কিভাবে কাজ করে?" : "How does Trust Score work?",
      answer: language === 'bn'
        ? "Trust Score আপনার কমিউনিটি কার্যক্রমের উপর ভিত্তি করে বৃদ্ধি পায়। অন্যদের সাহায্য করা, ইতিবাচক প্রতিক্রিয়া পাওয়া এবং নিয়মিত অংশগ্রহণের মাধ্যমে আপনার স্কোর বাড়ে।"
        : "Trust Score increases based on your community activities. Helping others, receiving positive feedback, and regular participation all contribute to your score."
    },
    {
      question: language === 'bn' ? "মোবাইলে কি ব্যবহার করা যায়?" : "Can I use it on mobile?",
      answer: language === 'bn'
        ? "হ্যাঁ, UnityNets সম্পূর্ণ মোবাইল-বান্ধব। আপনি যেকোনো ডিভাইস থেকে ওয়েব ব্রাউজারে ব্যবহার করতে পারবেন।"
        : "Yes, UnityNets is fully mobile-friendly. You can access it from any device through your web browser."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'bn' ? "সাধারণ প্রশ্নাবলী" : "Frequently Asked Questions"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === 'bn' 
              ? "UnityNets সম্পর্কে আপনার প্রশ্নের উত্তর খুঁজুন"
              : "Find answers to common questions about UnityNets"
            }
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-background rounded-lg border px-6 shadow-sm animate-fade-in hover:shadow-md transition-shadow duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AccordionTrigger className="text-left hover:no-underline py-5">
                <span className="font-medium text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
