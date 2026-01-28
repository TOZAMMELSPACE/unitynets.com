import { Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocalEventsProps {
  posts: Post[];
  onCreateEvent?: () => void;
}

export const LocalEvents = ({ posts, onCreateEvent }: LocalEventsProps) => {
  const { language, t } = useLanguage();
  const eventPosts = posts
    .filter(post => post.postType === 'event' && post.community !== 'global')
    .slice(0, 3);

  return (
    <div className="card-enhanced p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {t('Local Events', 'স্থানীয় ইভেন্ট')}
        </h3>
        {onCreateEvent && (
          <Button variant="outline" size="sm" onClick={onCreateEvent}>
            <Plus className="w-4 h-4 mr-2" />
            {t('Create', 'তৈরি করুন')}
          </Button>
        )}
      </div>
      
      {eventPosts.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-sm">
            {t('No events in your area yet', 'আপনার এলাকায় এখনো কোনো ইভেন্ট নেই')}
          </p>
          {onCreateEvent && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onCreateEvent}>
              {t('Create first event', 'প্রথম ইভেন্ট তৈরি করুন')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {eventPosts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 
                         transition-colors cursor-pointer border border-accent/20"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm line-clamp-1">
                  {post.eventDetails?.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {post.community}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.eventDetails?.date && 
                    new Date(post.eventDetails.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')
                  }
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{post.eventDetails?.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {post.likes || 0} {t('interested', 'আগ্রহী')}
                </div>
              </div>
              
              {post.eventDetails?.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {post.eventDetails.description}
                </p>
              )}
            </div>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full">
            {t('View all events', 'সব ইভেন্ট দেখুন')}
          </Button>
        </div>
      )}
    </div>
  );
};