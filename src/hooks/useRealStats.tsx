import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealStats {
  activeUsers: number;
  totalPosts: number;
  isLoading: boolean;
}

export const useRealStats = (): RealStats => {
  const [stats, setStats] = useState<RealStats>({
    activeUsers: 0,
    totalPosts: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count from profiles
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch post count
        const { count: postCount, error: postError } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true });

        if (!userError && !postError) {
          setStats({
            activeUsers: userCount || 0,
            totalPosts: postCount || 0,
            isLoading: false,
          });
        } else {
          setStats(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();

    // Set up real-time subscriptions for updates
    const profilesChannel = supabase
      .channel("stats-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchStats()
      )
      .subscribe();

    const postsChannel = supabase
      .channel("stats-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(postsChannel);
    };
  }, []);

  return stats;
};
