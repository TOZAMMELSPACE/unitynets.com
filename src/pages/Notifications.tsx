import { useEffect } from "react";
import { User } from "@/lib/storage";
import { Bell, Heart, MessageCircle, UserPlus, UserCheck, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationsDB } from "@/hooks/useNotificationsDB";
import { useSocial } from "@/hooks/useSocial";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocialDB } from "@/hooks/useSocialDB";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationsProps {
  currentUser: User | null;
  users: User[];
  onSignOut: () => void;
  socialActions: ReturnType<typeof useSocial>;
  socialDB: ReturnType<typeof useSocialDB>;
  setUsers: (users: User[]) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-5 h-5 text-destructive fill-destructive" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-primary" />;
    case "follow":
      return <UserPlus className="w-5 h-5 text-accent" />;
    case "friend_request":
      return <UserPlus className="w-5 h-5 text-primary" />;
    case "friend_accept":
      return <UserCheck className="w-5 h-5 text-accent" />;
    case "new_post":
      return <FileText className="w-5 h-5 text-primary" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

export default function Notifications({ 
  currentUser, 
  users, 
  onSignOut, 
  socialActions,
  socialDB,
  setUsers 
}: NotificationsProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = 
    useNotificationsDB(currentUser?.id || null);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    // Mark notifications as read when viewed
    const timer = setTimeout(() => {
      notifications.forEach(n => {
        if (!n.is_read) {
          markAsRead(n.id);
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [notifications, markAsRead]);

  const handleAcceptRequest = async (fromUserId: string, notificationId: string) => {
    const request = socialDB.friendRequests.find(r => r.sender_id === fromUserId);
    if (request) {
      await socialDB.acceptFriendRequest(request.id, fromUserId);
    }
    deleteNotification(notificationId);
  };

  const handleRejectRequest = async (fromUserId: string, notificationId: string) => {
    const request = socialDB.friendRequests.find(r => r.sender_id === fromUserId);
    if (request) {
      await socialDB.rejectFriendRequest(request.id);
    }
    deleteNotification(notificationId);
  };

  const handleUserClick = (userId: string) => {
    navigate('/profile', { state: { userId } });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-4 max-w-2xl pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("Notifications", "বিজ্ঞপ্তি")}</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
            >
              {t("Mark all as read", "সব পড়া হয়েছে")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("No notifications", "কোন বিজ্ঞপ্তি নেই")}</h3>
              <p className="text-muted-foreground">
                {t("When you get new likes, comments or follows, they will appear here", "নতুন লাইক, কমেন্ট বা ফলো পেলে এখানে দেখতে পাবেন")}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card-enhanced p-4 transition-all ${
                  !notification.is_read ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar 
                    className="w-10 h-10 flex-shrink-0 cursor-pointer hover:ring-2 ring-primary transition-all"
                    onClick={() => handleUserClick(notification.from_user_id)}
                  >
                    <AvatarImage src={notification.fromUserImage} />
                    <AvatarFallback>{notification.fromUserName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="font-semibold cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleUserClick(notification.from_user_id)}
                          >
                            {notification.fromUserName}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>

                        {notification.type === 'friend_request' && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAcceptRequest(notification.from_user_id, notification.id)}
                            >
                              {t("Accept", "গ্রহণ করুন")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(notification.from_user_id, notification.id)}
                            >
                              {t("Reject", "প্রত্যাখ্যান")}
                            </Button>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}