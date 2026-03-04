import { Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Clock, MapPin, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface JobBoardProps {
  posts: Post[];
  onCreateJob?: () => void;
}

export const JobBoard = ({ posts, onCreateJob }: JobBoardProps) => {
  const { language, t } = useLanguage();
  const jobPosts = posts
    .filter(post => post.postType === 'job')
    .slice(0, 3);

  return (
    <div className="card-enhanced p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-warning" />
          {t('Job Opportunities', 'কাজের সুযোগ')}
        </h3>
        {onCreateJob && (
          <Button variant="outline" size="sm" onClick={onCreateJob}>
            <Plus className="w-4 h-4 mr-2" />
            {t('Post', 'পোস্ট করুন')}
          </Button>
        )}
      </div>
      
      {jobPosts.length === 0 ? (
        <div className="text-center py-6">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-sm">
            {t('No job opportunities posted yet', 'এখনো কোনো কাজের সুযোগ পোস্ট করা হয়নি')}
          </p>
          {onCreateJob && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onCreateJob}>
              {t('Post first job', 'প্রথম কাজ পোস্ট করুন')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jobPosts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-lg bg-warning/5 hover:bg-warning/10 
                         transition-colors cursor-pointer border border-warning/20"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm line-clamp-1">
                  {post.jobDetails?.title}
                </h4>
                <Badge variant="outline" className="text-xs bg-warning/10">
                  {post.community === 'global' ? '🌍' : '🏘️'}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {post.jobDetails?.budget}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.jobDetails?.deadline && 
                    new Date(post.jobDetails.deadline).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')
                  }
                </div>
                {post.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{post.location}</span>
                  </div>
                )}
              </div>
              
              {post.jobDetails?.skills && post.jobDetails.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.jobDetails.skills.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {post.jobDetails.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{post.jobDetails.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {post.jobDetails?.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {post.jobDetails.description}
                </p>
              )}
            </div>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full">
            {t('View all jobs', 'সব কাজ দেখুন')}
          </Button>
        </div>
      )}
    </div>
  );
};