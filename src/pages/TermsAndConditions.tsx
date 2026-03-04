import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield, Users, MessageSquare, Lock, AlertTriangle, Scale, Heart, FileText, Globe, Ban, CreditCard, Gavel, Mail, Phone, Clock, Wallet, UserCheck, BadgeCheck, Eye, Database, Bell, Trash2 } from "lucide-react";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Globe,
      title: "1. Terms of Service",
      content: `UnityNets is a global platform. People from any country can join.

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
      title: "2. User Responsibilities",
      content: `While using the platform, you will:
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
      title: "3. Content Policy",
      content: `You are responsible for the content you post. The following content is prohibited:
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
      title: "4. Privacy & Data Protection",
      content: `We respect your privacy:
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
      title: "5. Unity Note System",
      content: `Unity Note is our time-based currency system:
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
      title: "6. Prohibited Activities",
      content: `The following activities are strictly prohibited:
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
      title: "7. Verification & Trust Score",
      content: `To increase your trustworthiness:
• Verify identity with government-issued ID
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
      title: "8. Communication & Notifications",
      content: `Communication policies:
• We may send important updates via email/SMS
• You can change your notification settings
• Do not use inappropriate language in messages
• Do not send marketing messages without permission
• We are not responsible for off-platform communication
• Sending spam messages may result in account restrictions`
    },
    {
      icon: Scale,
      title: "9. Dispute Resolution",
      content: `In case of disputes:
• First try to resolve through direct discussion
• If unresolved, contact UnityNets support
• We will try to respond within 7 business days
• Complaints without evidence are not acceptable
• False accusations will result in action against complainant
• UnityNets' final decision is binding`
    },
    {
      icon: Gavel,
      title: "10. Legal Matters",
      content: `• These terms are governed by international standards
• Any disputes will be resolved through arbitration
• UnityNets may modify terms at any time
• You will be notified of significant changes
• Violation of terms may result in account suspension
• We reserve the right to discontinue service without notice
• By using this platform, you agree to these terms`
    },
    {
      icon: Shield,
      title: "11. Limitation of Liability",
      content: `• UnityNets is not liable for any direct or indirect damages
• UnityNets does not bear responsibility for user transactions
• The platform is provided on an "as is" basis
• We do not guarantee uninterrupted service
• We are not responsible for third-party links or content
• Not liable for natural disasters or uncontrolled events
• No compensation applies for server downtime`
    },
    {
      icon: Trash2,
      title: "12. Account Suspension & Deletion",
      content: `Account policies:
• You can delete your account at any time
• Accounts may be suspended or terminated for violations
• Terminated account data will be deleted after 30 days
• Re-registration may be prohibited for serious offenses
• Unity Notes will be lost upon account deletion
• Cannot delete account with active disputes`
    },
    {
      icon: Database,
      title: "13. Data Retention Policy",
      content: `Data we retain:
• Profile information: Until account is active
• Posts and comments: Until deleted
• Messages: Automatically deleted after 1 year
• Log files: Up to 6 months
• Transaction records: Up to 5 years (legal requirements)
• Backup data: Deleted after 90 days`
    },
    {
      icon: Globe,
      title: "14. International Usage",
      content: `For global usage:
• This platform serves users worldwide, starting from South Asia
• Follow your local laws when using the platform
• VPN usage may have restrictions
• Some services may apply to specific regions
• Different rules may apply in different countries`
    },
    {
      icon: Eye,
      title: "15. Privacy Policy",
      content: `Our Privacy Policy:

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
            <h1 className="text-base sm:text-lg font-semibold">Terms & Conditions</h1>
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
                  UnityNets Terms & Guidelines
                </h2>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Welcome to UnityNets — a trusted social platform where people help each other, learn together, and grow stronger as a community. We believe every person's time has equal value.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-primary/10">
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">15</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Sections</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">100%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Transparent</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">Global</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Coverage</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-lg">
                <p className="text-lg sm:text-xl font-bold text-primary">24/7</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Support</p>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 border-t border-primary/10">
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last Updated: December 2024
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mb-6 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {sections.map((section, index) => (
                <button 
                  key={index}
                  onClick={() => document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[10px] sm:text-xs text-left p-2 bg-background/50 hover:bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-colors truncate"
                >
                  {section.title}
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
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">
                    {section.title}
                  </h3>
                </div>
                
                <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs sm:text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {section.content}
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
            <h3 className="font-bold text-base sm:text-lg mb-2">Agreement</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              By registering on UnityNets, you acknowledge that you have read and agree to all the terms and conditions stated above.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full sm:w-auto px-6 sm:px-8">
              <BadgeCheck className="w-4 h-4 mr-2" />
              I Agree
            </Button>
          </div>

          {/* Contact */}
          <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-sm font-semibold text-center mb-3">Contact Us</h3>
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
              We aim to respond within 7 business days.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center pb-6">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              © 2025 UnityNets. All rights reserved.
            </p>
          </div>
        </main>
      </ScrollArea>
    </div>
  );
};

export default TermsAndConditions;
