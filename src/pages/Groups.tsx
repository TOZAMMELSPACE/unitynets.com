import { User } from "@/lib/storage";
import { Users, Plus, Lock, Globe, Crown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GroupsProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const myGroups = [
  {
    id: "1",
    name: "ঢাকা টেক কমিউনিটি",
    members: 156,
    description: "প্রযুক্তি এবং উদ্ভাবন নিয়ে আলোচনা",
    isPrivate: false,
    isAdmin: true,
    lastActivity: "১০ মিনিট আগে",
  },
  {
    id: "2",
    name: "স্থানীয় ব্যবসা নেটওয়ার্ক",
    members: 89,
    description: "স্থানীয় ব্যবসায়ীদের নেটওয়ার্কিং",
    isPrivate: true,
    isAdmin: false,
    lastActivity: "৩০ মিনিট আগে",
  },
];

const suggestedGroups = [
  {
    id: "3",
    name: "শিক্ষা সংস্কার আন্দোলন",
    members: 234,
    description: "শিক্ষা ব্যবস্থার উন্নয়ন নিয়ে কাজ",
    isPrivate: false,
    category: "শিক্ষা",
  },
  {
    id: "4",
    name: "স্বাস্থ্য সচেতনতা",
    members: 178,
    description: "স্বাস্থ্য টিপস এবং সচেতনতা",
    isPrivate: false,
    category: "স্বাস্থ্য",
  },
  {
    id: "5",  
    name: "উদ্যোক্তা সমিতি",
    members: 145,
    description: "নতুন উদ্যোক্তাদের সহায়তা",
    isPrivate: true,
    category: "ব্যবসা",
  },
];

export default function Groups({ currentUser, onSignOut }: GroupsProps) {
  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-bengali">গ্রুপসমূহ</h2>
            <Button size="sm" className="gap-2">
              <Plus size={16} />
              নতুন গ্রুপ
            </Button>
          </div>
        </div>

        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-groups" className="text-bengali">
              আমার গ্রুপ ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="text-bengali">
              আবিষ্কার করুন
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-4">
            {myGroups.map((group) => (
              <div key={group.id} className="card-enhanced p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-bengali">{group.name}</h3>
                      {group.isAdmin && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {group.isPrivate ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Globe className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground text-bengali mb-2">
                      {group.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-bengali">{group.members} সদস্য</span>
                      <span className="text-bengali">{group.lastActivity}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="text-bengali">
                    দেখুন
                  </Button>
                </div>
              </div>
            ))}

            {myGroups.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-bengali">কোন গ্রুপে যোগ দেননি</h3>
                <p className="text-muted-foreground text-bengali mb-4">
                  আপনার আগ্রহের বিষয়ে গ্রুপ খুঁজুন এবং যোগ দিন
                </p>
                <Button className="gap-2">
                  <Plus size={16} />
                  গ্রুপ খুঁজুন
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            <div className="mb-4">
              <h3 className="font-semibold text-bengali mb-2">প্রস্তাবিত গ্রুপ</h3>
              <p className="text-sm text-muted-foreground text-bengali">
                আপনার আগ্রহ অনুযায়ী নির্বাচিত গ্রুপসমূহ
              </p>
            </div>

            {suggestedGroups.map((group) => (
              <div key={group.id} className="card-enhanced p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-bengali">{group.name}</h3>
                      {group.isPrivate ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Globe className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground text-bengali mb-2">
                      {group.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="text-bengali">{group.members} সদস্য</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-bengali">
                        {group.category}
                      </span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="text-bengali">
                    যোগ দিন
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
    </main>
  );
}