import { Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";

interface LocalEventsProps {
  posts: Post[];
  onCreateEvent?: () => void;
}

export const LocalEvents = ({ posts, onCreateEvent }: LocalEventsProps) => {
  const eventPosts = posts
    .filter(post => post.postType === 'event' && post.community !== 'global')
    .slice(0, 3);

  return (
    <div className="card-enhanced p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          স্থানীয় ইভেন্ট
        </h3>
        {onCreateEvent && (
          <Button variant="outline" size="sm" onClick={onCreateEvent}>
            <Plus className="w-4 h-4 mr-2" />
            তৈরি করুন
          </Button>
        )}
      </div>
      
      {eventPosts.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-sm text-bengali">
            আপনার এলাকায় এখনো কোনো ইভেন্ট নেই
          </p>
          {onCreateEvent && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onCreateEvent}>
              প্রথম ইভেন্ট তৈরি করুন
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
                <h4 className="font-medium text-sm text-bengali line-clamp-1">
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
                    new Date(post.eventDetails.date).toLocaleDateString('bn-BD')
                  }
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{post.eventDetails?.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {post.likes || 0} আগ্রহী
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
            সব ইভেন্ট দেখুন
          </Button>
        </div>
      )}
    </div>
  );
};