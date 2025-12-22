import { Link } from "react-router-dom";
import { Facebook, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="UnityNets Logo" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-primary">UnityNets</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-bengali">
              Trust • Learn • Unite — একত্রে শক্তিশালী। 
              দক্ষিণ এশিয়া থেকে সারা বিশ্বে ঐক্যের সেতুবন্ধন।
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com/unitynets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@unitynets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-bengali">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm text-bengali">
                  হোম
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm text-bengali">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link to="/unity-note" className="text-muted-foreground hover:text-primary transition-colors text-sm text-bengali">
                  ইউনিটি নোটস
                </Link>
              </li>
              <li>
                <Link to="/learning-zone" className="text-muted-foreground hover:text-primary transition-colors text-sm text-bengali">
                  লার্নিং জোন
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-bengali">আইনি</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm text-bengali">
                  শর্তাবলী ও নীতিমালা
                </Link>
              </li>
              <li>
                <a href="https://unitynets.com/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm text-bengali">
                  গোপনীয়তা নীতি
                </a>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="https://unitynets.com/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-bengali">যোগাযোগ</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>contact@unitynets.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-bengali">ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 UnityNets. All rights reserved. | 
            <span className="text-bengali"> সর্বস্বত্ব সংরক্ষিত।</span>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="text-bengali">ভালোবাসা দিয়ে তৈরি</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
            <span className="text-bengali">বাংলাদেশ থেকে</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
