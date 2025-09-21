import { Header } from "@/components/Header";
import { User } from "@/lib/storage";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";

interface NotificationsProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const mockNotifications = [
  {
    id: "1",
    type: "like",
    user: "রহিম আহমেদ",
    content: "আপনার পোস্টে লাইক দিয়েছেন",
    time: "২ মিনিট আগে",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    user: "সালমা খাতুন",
    content: "আপনার পোস্টে কমেন্ট করেছেন",
    time: "১৫ মিনিট আগে",
    read: false,
  },
  {
    id: "3",
    type: "follow",
    user: "করিম উল্লাহ",
    content: "আপনাকে ফলো করেছেন",
    time: "১ ঘন্টা আগে",
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-destructive" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-primary" />;
    case "follow":
      return <UserPlus className="w-5 h-5 text-accent" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

export default function Notifications({ currentUser, onSignOut }: NotificationsProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header currentUser={currentUser} onSignOut={onSignOut} />
      
      <main className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-bengali mb-2">বিজ্ঞপ্তি</h2>
          <p className="text-muted-foreground">আপনার সকল নোটিফিকেশন দেখুন</p>
        </div>

        <div className="space-y-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card-enhanced p-4 transition-all ${
                !notification.read ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-bengali">{notification.user}</span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className="text-muted-foreground text-bengali mb-2">
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground text-bengali">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-bengali">কোন বিজ্ঞপ্তি নেই</h3>
            <p className="text-muted-foreground text-bengali">
              নতুন লাইক, কমেন্ট বা ফলো পেলে এখানে দেখতে পাবেন
            </p>
          </div>
        )}
      </main>
    </div>
  );
}