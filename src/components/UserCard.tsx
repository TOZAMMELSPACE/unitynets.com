import { User } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserCardProps {
  user: User;
  currentUserId?: string;
  isFollowing: boolean;
  hasSentRequest: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onSendRequest: () => void;
}

export const UserCard = ({ 
  user, 
  currentUserId, 
  isFollowing, 
  hasSentRequest,
  onFollow, 
  onUnfollow,
  onSendRequest 
}: UserCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="card-enhanced p-4 hover:bg-muted/50 transition-all cursor-pointer">
      <div className="flex items-start gap-3">
        <Avatar 
          className="w-12 h-12 cursor-pointer" 
          onClick={() => navigate('/profile', { state: { userId: user.id } })}
        >
          <AvatarImage src={user.profileImage} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div 
            className="flex items-center gap-2 mb-1 cursor-pointer"
            onClick={() => navigate('/profile', { state: { userId: user.id } })}
          >
            <h4 className="font-semibold truncate">{user.name}</h4>
            {user.isVerified && (
              <Badge variant="secondary" className="text-xs">✓</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {user.bio}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{user.followers} {t('followers', 'ফলোয়ার')}</span>
            <span>{t('Trust', 'ট্রাস্ট')}: {Math.round(user.trustScore)}</span>
          </div>
        </div>

        {!isCurrentUser && (
          <div>
            {isFollowing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onUnfollow}
                className="gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {t('Following', 'ফলোয়িং')}
              </Button>
            ) : hasSentRequest ? (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {t('Request Sent', 'রিকোয়েস্ট পাঠানো')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={onFollow}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('Follow', 'ফলো')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
