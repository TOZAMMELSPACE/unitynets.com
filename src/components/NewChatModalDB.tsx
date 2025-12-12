import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, MessageCircle } from "lucide-react";
import { useMessages, Conversation } from "@/hooks/useMessages";

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  trust_score: number | null;
}

interface NewChatModalDBProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatCreated: (conversation: Conversation) => void;
}

export const NewChatModalDB = ({ open, onClose, currentUserId, onChatCreated }: NewChatModalDBProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { getOrCreateConversation } = useMessages(currentUserId);

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, trust_score')
        .neq('user_id', currentUserId)
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async (otherUser: Profile) => {
    const conversation = await getOrCreateConversation(otherUser.user_id);
    
    if (conversation) {
      // Add other user info for display
      const convWithProfile: Conversation = {
        ...conversation,
        other_user: {
          id: otherUser.user_id,
          full_name: otherUser.full_name,
          avatar_url: otherUser.avatar_url
        }
      };
      onChatCreated(convWithProfile);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-bengali">নতুন চ্যাট শুরু করুন</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ব্যবহারকারী খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-bengali"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-bengali">লোড হচ্ছে...</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-bengali">কোন ব্যবহারকারী পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredProfiles.map((profile) => (
                <div
                  key={profile.user_id}
                  onClick={() => handleCreateChat(profile)}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {profile.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-bengali">{profile.full_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Trust Score: {profile.trust_score || 0}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
