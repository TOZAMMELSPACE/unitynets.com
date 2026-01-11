import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LocationStats {
  location: string;
  count: number;
}

// Map of location strings to country data
const countryMapping: Record<string, { 
  country: string; 
  coordinates: [number, number]; 
  flag: string; 
  region: string;
}> = {
  // Bangladesh variations
  "bangladesh": { country: "Bangladesh", coordinates: [90.3563, 23.685], flag: "🇧🇩", region: "South Asia" },
  "dhaka": { country: "Bangladesh", coordinates: [90.3563, 23.685], flag: "🇧🇩", region: "South Asia" },
  "chittagong": { country: "Bangladesh", coordinates: [90.3563, 23.685], flag: "🇧🇩", region: "South Asia" },
  "sylhet": { country: "Bangladesh", coordinates: [90.3563, 23.685], flag: "🇧🇩", region: "South Asia" },
  "rajshahi": { country: "Bangladesh", coordinates: [90.3563, 23.685], flag: "🇧🇩", region: "South Asia" },
  "khulna": { country: "Bangladesh", coordinates: [90.3563, 23.685], flag: "🇧🇩", region: "South Asia" },
  
  // India variations
  "india": { country: "India", coordinates: [78.9629, 20.5937], flag: "🇮🇳", region: "South Asia" },
  "mumbai": { country: "India", coordinates: [78.9629, 20.5937], flag: "🇮🇳", region: "South Asia" },
  "delhi": { country: "India", coordinates: [78.9629, 20.5937], flag: "🇮🇳", region: "South Asia" },
  "kolkata": { country: "India", coordinates: [78.9629, 20.5937], flag: "🇮🇳", region: "South Asia" },
  "bangalore": { country: "India", coordinates: [78.9629, 20.5937], flag: "🇮🇳", region: "South Asia" },
  
  // Pakistan
  "pakistan": { country: "Pakistan", coordinates: [69.3451, 30.3753], flag: "🇵🇰", region: "South Asia" },
  "karachi": { country: "Pakistan", coordinates: [69.3451, 30.3753], flag: "🇵🇰", region: "South Asia" },
  "lahore": { country: "Pakistan", coordinates: [69.3451, 30.3753], flag: "🇵🇰", region: "South Asia" },
  "islamabad": { country: "Pakistan", coordinates: [69.3451, 30.3753], flag: "🇵🇰", region: "South Asia" },
  
  // Nepal
  "nepal": { country: "Nepal", coordinates: [84.124, 28.3949], flag: "🇳🇵", region: "South Asia" },
  "kathmandu": { country: "Nepal", coordinates: [84.124, 28.3949], flag: "🇳🇵", region: "South Asia" },
  
  // Sri Lanka
  "sri lanka": { country: "Sri Lanka", coordinates: [80.7718, 7.8731], flag: "🇱🇰", region: "South Asia" },
  "colombo": { country: "Sri Lanka", coordinates: [80.7718, 7.8731], flag: "🇱🇰", region: "South Asia" },
  
  // UAE
  "uae": { country: "UAE", coordinates: [53.8478, 23.4241], flag: "🇦🇪", region: "Middle East" },
  "dubai": { country: "UAE", coordinates: [53.8478, 23.4241], flag: "🇦🇪", region: "Middle East" },
  "abu dhabi": { country: "UAE", coordinates: [53.8478, 23.4241], flag: "🇦🇪", region: "Middle East" },
  "united arab emirates": { country: "UAE", coordinates: [53.8478, 23.4241], flag: "🇦🇪", region: "Middle East" },
  
  // Saudi Arabia
  "saudi arabia": { country: "Saudi Arabia", coordinates: [45.0792, 23.8859], flag: "🇸🇦", region: "Middle East" },
  "riyadh": { country: "Saudi Arabia", coordinates: [45.0792, 23.8859], flag: "🇸🇦", region: "Middle East" },
  "jeddah": { country: "Saudi Arabia", coordinates: [45.0792, 23.8859], flag: "🇸🇦", region: "Middle East" },
  
  // Qatar
  "qatar": { country: "Qatar", coordinates: [51.1839, 25.3548], flag: "🇶🇦", region: "Middle East" },
  "doha": { country: "Qatar", coordinates: [51.1839, 25.3548], flag: "🇶🇦", region: "Middle East" },
  
  // Kuwait
  "kuwait": { country: "Kuwait", coordinates: [47.4818, 29.3117], flag: "🇰🇼", region: "Middle East" },
  
  // Oman
  "oman": { country: "Oman", coordinates: [55.9754, 21.4735], flag: "🇴🇲", region: "Middle East" },
  "muscat": { country: "Oman", coordinates: [55.9754, 21.4735], flag: "🇴🇲", region: "Middle East" },
  
  // Malaysia
  "malaysia": { country: "Malaysia", coordinates: [101.9758, 4.2105], flag: "🇲🇾", region: "Southeast Asia" },
  "kuala lumpur": { country: "Malaysia", coordinates: [101.9758, 4.2105], flag: "🇲🇾", region: "Southeast Asia" },
  
  // Singapore
  "singapore": { country: "Singapore", coordinates: [103.8198, 1.3521], flag: "🇸🇬", region: "Southeast Asia" },
  
  // USA
  "usa": { country: "USA", coordinates: [-95.7129, 37.0902], flag: "🇺🇸", region: "North America" },
  "united states": { country: "USA", coordinates: [-95.7129, 37.0902], flag: "🇺🇸", region: "North America" },
  "new york": { country: "USA", coordinates: [-95.7129, 37.0902], flag: "🇺🇸", region: "North America" },
  "los angeles": { country: "USA", coordinates: [-95.7129, 37.0902], flag: "🇺🇸", region: "North America" },
  "california": { country: "USA", coordinates: [-95.7129, 37.0902], flag: "🇺🇸", region: "North America" },
  "texas": { country: "USA", coordinates: [-95.7129, 37.0902], flag: "🇺🇸", region: "North America" },
  
  // UK
  "uk": { country: "UK", coordinates: [-3.436, 55.3781], flag: "🇬🇧", region: "Europe" },
  "united kingdom": { country: "UK", coordinates: [-3.436, 55.3781], flag: "🇬🇧", region: "Europe" },
  "london": { country: "UK", coordinates: [-3.436, 55.3781], flag: "🇬🇧", region: "Europe" },
  "england": { country: "UK", coordinates: [-3.436, 55.3781], flag: "🇬🇧", region: "Europe" },
  
  // Canada
  "canada": { country: "Canada", coordinates: [-106.3468, 56.1304], flag: "🇨🇦", region: "North America" },
  "toronto": { country: "Canada", coordinates: [-106.3468, 56.1304], flag: "🇨🇦", region: "North America" },
  "vancouver": { country: "Canada", coordinates: [-106.3468, 56.1304], flag: "🇨🇦", region: "North America" },
  
  // Australia
  "australia": { country: "Australia", coordinates: [133.7751, -25.2744], flag: "🇦🇺", region: "Oceania" },
  "sydney": { country: "Australia", coordinates: [133.7751, -25.2744], flag: "🇦🇺", region: "Oceania" },
  "melbourne": { country: "Australia", coordinates: [133.7751, -25.2744], flag: "🇦🇺", region: "Oceania" },
  
  // Germany
  "germany": { country: "Germany", coordinates: [10.4515, 51.1657], flag: "🇩🇪", region: "Europe" },
  "berlin": { country: "Germany", coordinates: [10.4515, 51.1657], flag: "🇩🇪", region: "Europe" },
  "munich": { country: "Germany", coordinates: [10.4515, 51.1657], flag: "🇩🇪", region: "Europe" },
  
  // Italy
  "italy": { country: "Italy", coordinates: [12.5674, 41.8719], flag: "🇮🇹", region: "Europe" },
  "rome": { country: "Italy", coordinates: [12.5674, 41.8719], flag: "🇮🇹", region: "Europe" },
  "milan": { country: "Italy", coordinates: [12.5674, 41.8719], flag: "🇮🇹", region: "Europe" },
  
  // Japan
  "japan": { country: "Japan", coordinates: [138.2529, 36.2048], flag: "🇯🇵", region: "East Asia" },
  "tokyo": { country: "Japan", coordinates: [138.2529, 36.2048], flag: "🇯🇵", region: "East Asia" },
  
  // South Korea
  "south korea": { country: "South Korea", coordinates: [127.7669, 35.9078], flag: "🇰🇷", region: "East Asia" },
  "korea": { country: "South Korea", coordinates: [127.7669, 35.9078], flag: "🇰🇷", region: "East Asia" },
  "seoul": { country: "South Korea", coordinates: [127.7669, 35.9078], flag: "🇰🇷", region: "East Asia" },
};

export interface AggregatedLocation {
  name: string;
  coordinates: [number, number];
  members: number;
  flag: string;
  region: string;
  isHub: boolean;
  color: string;
}

export const useLocationStats = () => {
  const [rawStats, setRawStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    const fetchLocationStats = async () => {
      try {
        // Fetch all profiles with locations
        const { data, error } = await supabase
          .from('profiles')
          .select('location')
          .not('location', 'is', null)
          .not('location', 'eq', '');

        if (error) {
          console.error('Error fetching location stats:', error);
          return;
        }

        // Count by location
        const locationCounts: Record<string, number> = {};
        data?.forEach(profile => {
          if (profile.location) {
            const loc = profile.location.toLowerCase().trim();
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
          }
        });

        const stats = Object.entries(locationCounts).map(([location, count]) => ({
          location,
          count,
        }));

        setRawStats(stats);

        // Get total member count
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        setTotalMembers(count || 0);
      } catch (err) {
        console.error('Error in fetchLocationStats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationStats();
  }, []);

  // Aggregate stats by country
  const aggregatedLocations = useMemo((): AggregatedLocation[] => {
    const countryStats: Record<string, number> = {};

    rawStats.forEach(stat => {
      const mapping = countryMapping[stat.location.toLowerCase()];
      if (mapping) {
        countryStats[mapping.country] = (countryStats[mapping.country] || 0) + stat.count;
      }
    });

    // Convert to AggregatedLocation array
    const locations: AggregatedLocation[] = [];
    const seenCountries = new Set<string>();

    Object.entries(countryStats).forEach(([country, count]) => {
      if (seenCountries.has(country)) return;
      seenCountries.add(country);

      // Find the country data from mapping
      const countryData = Object.values(countryMapping).find(m => m.country === country);
      if (countryData) {
        locations.push({
          name: country,
          coordinates: countryData.coordinates,
          members: count,
          flag: countryData.flag,
          region: countryData.region,
          isHub: count >= 5, // Mark as hub if 5+ members
          color: count >= 5 ? "hsl(var(--primary))" : "hsl(var(--accent))",
        });
      }
    });

    // Sort by member count
    return locations.sort((a, b) => b.members - a.members);
  }, [rawStats]);

  // Get unique countries count
  const countriesCount = useMemo(() => {
    return aggregatedLocations.length;
  }, [aggregatedLocations]);

  return {
    locations: aggregatedLocations,
    totalMembers,
    countriesCount,
    loading,
    hasData: aggregatedLocations.length > 0,
  };
};
