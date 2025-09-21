import { Header } from "@/components/Header";
import { User, Post } from "@/lib/storage";
import { Edit, Award, MessageCircle, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileProps {
  currentUser: User | null;
  onSignOut: () => void;
  posts: Post[];
}

export default function Profile({ currentUser, onSignOut, posts }: ProfileProps) {
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const userPosts = posts.filter(post => post.author.name === currentUser.name);
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header currentUser={currentUser} onSignOut={onSignOut} />
      
      <main className="container mx-auto px-4 max-w-2xl">
        {/* Profile Header */}
        <div className="card-enhanced p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white text-bengali">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-bengali">{currentUser.name}</h1>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit size={16} />
                  সম্পাদনা
                </Button>
              </div>
              
              <p className="text-muted-foreground text-bengali mb-3">
                NID: {currentUser.nidMasked}
              </p>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{userPosts.length}</div>
                  <div className="text-sm text-muted-foreground text-bengali">পোস্ট</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{totalLikes}</div>
                  <div className="text-sm text-muted-foreground text-bengali">লাইক</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-primary">
                      {Math.round(currentUser.trustScore)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground text-bengali">ট্রাস্ট স্কোর</div>
                </div>
              </div>
              
              <div className="trust-score text-bengali">
                ভেরিফাইড ব্যবহারকারী • বিশ্বস্ত সদস্য
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts" className="text-bengali">
              আমার পোস্ট ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-bengali">
              কার্যকলাপ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {userPosts.map((post) => (
              <div key={post.id} className="card-enhanced p-4">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground text-bengali">
                      {post.community} • {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <p className="text-bengali leading-relaxed">{post.content}</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-bengali">{post.likes || 0} লাইক</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-bengali">মন্তব্য</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share className="w-4 h-4" />
                    <span className="text-bengali">শেয়ার</span>
                  </div>
                </div>
              </div>
            ))}

            {userPosts.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-bengali">এখনও কোন পোস্ট নেই</h3>
                <p className="text-muted-foreground text-bengali">
                  আপনার প্রথম পোস্ট করুন এবং কমিউনিটির সাথে যুক্ত হন
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="card-enhanced p-4">
              <h3 className="font-semibold mb-3 text-bengali">সাম্প্রতিক কার্যকলাপ</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-bengali">আপনি করিম উল্লাহর পোস্টে লাইক দিয়েছেন</span>
                  <span className="text-muted-foreground text-bengali">২ ঘন্টা আগে</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-bengali">আপনি একটি পোস্ট করেছেন</span>
                  <span className="text-muted-foreground text-bengali">৫ ঘন্টা আগে</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-bengali">ট্রাস্ট স্কোর বৃদ্ধি পেয়েছে</span>
                  <span className="text-muted-foreground text-bengali">১ দিন আগে</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}