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
        const [userResult, postResult] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          activeUsers: userResult.count || 0,
          totalPosts: postResult.count || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
    // Removed realtime subscriptions - not needed on landing page, saves resources
  }, []);

  return stats;
};
