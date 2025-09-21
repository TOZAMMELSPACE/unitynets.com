import { Header } from "@/components/Header";
import { PostForm } from "@/components/PostForm";
import { Feed } from "@/components/Feed";
import { UsersList } from "@/components/UsersList";
import { LocalCommunity } from "@/components/LocalCommunity";
import { LearningZone } from "@/components/LearningZone";
import { User, Post } from "@/lib/storage";

interface IndexProps {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  onSignOut: () => void;
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onPostCreated: (post: Post) => void;
  onLikePost: (postId: string) => void;
}

const Index = ({
  currentUser,
  users,
  posts,
  onSignOut,
  onPostCreated,
  onLikePost,
}: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Header 
          currentUser={currentUser} 
          onSignOut={onSignOut} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="card-enhanced p-6">
              <h2 className="text-xl font-semibold mb-2">
                Welcome to UnityNet
              </h2>
              <p className="text-muted-foreground text-bengali">
                এই প্ল্যাটফর্মে আপনি স্থানীয় কমিউনিটির সাথে যুক্ত হতে পারেন, 
                জ্ঞান শেয়ার করতে পারেন এবং নতুন কিছু শিখতে পারেন।
              </p>
            </div>

            {/* Post Form */}
            <PostForm 
              user={currentUser} 
              onPostCreated={onPostCreated} 
            />

            {/* Feed */}
            <div className="card-enhanced p-6">
              <h3 className="text-lg font-semibold mb-4">Community Feed</h3>
              <Feed 
                posts={posts} 
                onLikePost={onLikePost} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UsersList 
              users={users} 
              currentUserId={currentUser?.id} 
            />
            
            <LocalCommunity posts={posts} />
            
            <LearningZone user={currentUser} />
            
            {/* Marketplace */}
            <div className="card-enhanced p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                🛍️ Marketplace
              </h3>
              <p className="text-sm text-muted-foreground text-bengali">
                ক্রিয়েটর ও ফ্রিল্যান্সারদের জন্য দ্রুত স্পট। 
                শীঘ্রই আসছে সম্পূর্ণ মার্কেটপ্লেস ইন্টিগ্রেশন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;