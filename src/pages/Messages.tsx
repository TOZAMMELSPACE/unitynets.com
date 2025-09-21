import { Header } from "@/components/Header";
import { User } from "@/lib/storage";
import { MessageCircle, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessagesProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const mockChats = [
  {
    id: "1",
    name: "রহিম আহমেদ",
    lastMessage: "নতুন প্রজেক্ট নিয়ে কথা বলব",
    time: "১০ মিনিট আগে",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "স্থানীয় কমিউনিটি গ্রুপ",
    lastMessage: "সালমা: আগামীকাল মিটিং হবে",
    time: "৩০ মিনিট আগে",
    unread: 0,
    online: false,
    isGroup: true,
  },
  {
    id: "3",
    name: "করিম উল্লাহ",
    lastMessage: "ধন্যবাদ ভাই, অনেক কাজে লাগলো",
    time: "২ ঘন্টা আগে",
    unread: 0,
    online: false,
  },
];

export default function Messages({ currentUser, onSignOut }: MessagesProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header currentUser={currentUser} onSignOut={onSignOut} />
      
      <main className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-bengali">চ্যাট</h2>
            <Button size="sm" className="gap-2">
              <Plus size={16} />
              নতুন চ্যাট
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="চ্যাট খুঁজুন..."
              className="pl-10 text-bengali"
            />
          </div>
        </div>

        <div className="space-y-2">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              className="card-enhanced p-4 hover:bg-muted/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-bengali">{chat.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground text-bengali">
                        {chat.time}
                      </span>
                      {chat.unread > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-bengali truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockChats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-bengali">কোন চ্যাট নেই</h3>
            <p className="text-muted-foreground text-bengali mb-4">
              নতুন চ্যাট শুরু করুন এবং কমিউনিটির সাথে যুক্ত হন
            </p>
            <Button className="gap-2">
              <Plus size={16} />
              নতুন চ্যাট শুরু করুন
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}