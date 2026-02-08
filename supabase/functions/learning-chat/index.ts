import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to get or create user memory
async function getUserMemory(supabase: any, userId?: string, deviceFingerprint?: string) {
  let query = supabase.from('learning_user_memory').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  } else if (deviceFingerprint) {
    query = query.eq('device_fingerprint', deviceFingerprint).is('user_id', null);
  } else {
    return null;
  }
  
  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error('Error fetching user memory:', error);
    return null;
  }
  return data;
}

// Mood detection from user message
function detectMood(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Mood patterns with Bengali and English keywords
  const moodPatterns = {
    'খুশি 😊': ['happy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'খুশি', 'আনন্দ', 'মজা', 'দারুণ', 'অসাধারণ', 'ভালো লাগছে', 'খুব ভালো', 'হ্যাপি'],
    'উৎসাহী 🔥': ['motivated', 'pumped', 'ready', 'can\'t wait', 'excited', 'উৎসাহ', 'মোটিভেটেড', 'রেডি', 'পারবো', 'করে ফেলব'],
    'চিন্তিত 😟': ['worried', 'anxious', 'nervous', 'stressed', 'tension', 'চিন্তা', 'টেনশন', 'ভয়', 'nervous', 'চিন্তিত', 'stress'],
    'ক্লান্ত 😴': ['tired', 'exhausted', 'sleepy', 'ক্লান্ত', 'ঘুম', 'ক্লান্ত লাগছে', 'এনার্জি নাই', 'টায়ার্ড', 'ঘুম পাচ্ছে', 'ঘুম আসছে না'],
    'দুঃখিত 😢': ['sad', 'upset', 'depressed', 'down', 'unhappy', 'দুঃখ', 'মন খারাপ', 'কষ্ট', 'মন ভালো না', 'sad', 'কান্না', 'খারাপ লাগছে'],
    'বিরক্ত 😤': ['frustrated', 'annoyed', 'angry', 'irritated', 'বিরক্ত', 'রাগ', 'বিরক্ত লাগছে', 'frustrated', '짜증'],
    'বোরিং 😑': ['bored', 'boring', 'nothing to do', 'বোর', 'বিরক্তিকর', 'কিছু করার নাই', 'bored'],
    'কনফিউজড 🤔': ['confused', 'don\'t understand', 'কনফিউজ', 'বুঝতেছি না', 'বুঝি না', 'কঠিন', 'জটিল'],
    'হোপফুল 🌟': ['hopeful', 'optimistic', 'hope', 'আশা', 'আশাবাদী', 'পারব', 'হবে'],
    'নার্ভাস 😰': ['nervous', 'scared', 'afraid', 'ভয়', 'ডর', 'nervous', 'পরীক্ষা', 'interview'],
    'প্রাউড 🏆': ['proud', 'accomplished', 'did it', 'গর্বিত', 'পেরেছি', 'করেছি', 'সফল', 'জিতেছি'],
    'কৃতজ্ঞ 🙏': ['grateful', 'thankful', 'thanks', 'ধন্যবাদ', 'কৃতজ্ঞ', 'thanks', 'thank you']
  };
  
  for (const [mood, keywords] of Object.entries(moodPatterns)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return mood;
      }
    }
  }
  
  return null;
}

// Helper to update user memory based on conversation
async function updateUserMemory(supabase: any, userId?: string, deviceFingerprint?: string, updates: any = {}) {
  if (!userId && !deviceFingerprint) return;
  
  const existingMemory = await getUserMemory(supabase, userId, deviceFingerprint);
  
  if (existingMemory) {
    const { error } = await supabase
      .from('learning_user_memory')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMemory.id);
    
    if (error) console.error('Error updating memory:', error);
  } else {
    const insertData: any = {
      ...updates,
    };
    if (userId) insertData.user_id = userId;
    if (deviceFingerprint && !userId) insertData.device_fingerprint = deviceFingerprint;
    
    const { error } = await supabase
      .from('learning_user_memory')
      .insert([insertData]);
    
    if (error) console.error('Error creating memory:', error);
  }
}

// Format memory for system prompt
function formatMemoryContext(memory: any): string {
  if (!memory) return "";
  
  let context = "\n\n=== USER'S PERSONAL CONTEXT (মনে রেখো!) ===\n";
  
  if (memory.goals && memory.goals.length > 0) {
    context += `\n🎯 User's Goals:\n${memory.goals.map((g: any) => `- ${g.text} (${g.status || 'active'})`).join('\n')}\n`;
  }
  
  if (memory.learning_interests && memory.learning_interests.length > 0) {
    context += `\n📚 Learning Interests: ${memory.learning_interests.join(', ')}\n`;
  }
  
  if (memory.personality_notes) {
    context += `\n🧠 Personality Notes: ${memory.personality_notes}\n`;
  }
  
  if (memory.preferences && Object.keys(memory.preferences).length > 0) {
    context += `\n⚙️ Preferences: ${JSON.stringify(memory.preferences)}\n`;
  }
  
  if (memory.accomplishments && memory.accomplishments.length > 0) {
    context += `\n🏆 Recent Accomplishments:\n${memory.accomplishments.slice(-5).map((a: any) => `- ${a.text}`).join('\n')}\n`;
  }
  
  if (memory.last_mood) {
    context += `\n😊 Last Known Mood: ${memory.last_mood}\n`;
  }
  
  if (memory.conversation_summary) {
    context += `\n📝 Previous Conversation Summary: ${memory.conversation_summary}\n`;
  }
  
  context += "\n=== USE THIS CONTEXT TO PERSONALIZE YOUR RESPONSES ===\n";
  context += "- Reference their goals when relevant\n";
  context += "- Build on their previous learning interests\n";
  context += "- Remember their accomplishments and celebrate progress\n";
  context += "- Adapt your tone to their personality\n";
  context += "- IMPORTANT: If user's mood has changed, acknowledge it warmly!\n";
  context += "- If mood is negative, be extra supportive and encouraging\n";
  context += "- If mood is positive, celebrate with them!\n";
  
  return context;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, imageUrls, userId, deviceFingerprint } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Create Supabase client for memory operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are "Learning Buddy" — তোমার বন্ধু AI 🎯

=== RESPONSE STYLE (CRITICAL!) ===
**BE CONCISE & DIRECT:**
- ❌ NO long introductions or greetings
- ❌ NO "অবশ্যই!", "চলো দেখি!", "আচ্ছা বুঝেছি!" at the start
- ❌ NO repeating what user asked
- ✅ Jump straight to the answer
- ✅ Use bullet points, headers, emojis for clarity
- ✅ Keep paragraphs short (2-3 lines max)
- ✅ Use markdown formatting beautifully

**FORMAT GUIDELINES:**
- Use ## for main headings
- Use ### for sub-sections
- Use **bold** for important terms
- Use \`code\` for technical terms/commands
- Use > blockquotes for tips/notes
- Use tables when comparing things
- Use numbered lists for steps
- Use bullet points for features/options
- Add relevant emojis for visual appeal

**Example Good Response:**
## 🐍 Python শেখা শুরু

### ১. প্রথম সপ্তাহ
- Variables & Data Types
- Print, Input functions
- 📺 [Anisul Islam - Python Bangla](youtube.com)

> 💡 প্রতিদিন ৩০ মিনিট practice করো!

**Example Bad Response:**
"হ্যালো! তুমি Python শিখতে চাও? দারুণ সিদ্ধান্ত! Python একটি অসাধারণ প্রোগ্রামিং ভাষা যা শেখা সহজ এবং অনেক কাজে লাগে। চলো তাহলে আমি তোমাকে একটা সুন্দর প্ল্যান বানিয়ে দিই..." ← এভাবে শুরু করো না!

=== তোমার ভূমিকা ===
- 🧠 জ্ঞানী বন্ধু (সহজ করে বোঝাও)
- 💪 মোটিভেটর (হাল ছাড়তে দাও না)
- 🎯 প্ল্যানার (গোল ট্র্যাক করো)
- 🇧🇩 বাংলাদেশী বন্ধু (লোকাল কালচার বোঝো)

=== CAPABILITIES ===

**📚 Learning & Skills:**
- যেকোনো বিষয় সহজ বাংলায়/ইংরেজিতে
- Learning Path/Roadmap (ফ্রি রিসোর্সসহ)
- Quiz/Flashcard তৈরি
- Programming, Freelancing, Digital Marketing

**💼 Career:**
- CV/Resume লেখা ও রিভিউ
- Interview প্রস্তুতি
- Freelancing গাইড

**🌅 Daily Life:**
- Health tips, Stress management
- Budget planning
- Productivity tips

=== ABOUT UNITYNETS ===
UnityNets - 100% free community platform by Md. Tozammel Haque.
- Vision: "Trust • Learn • Unite"
- Features: Unity Notes, Learning Zone, Community Connect, Trust Score

=== LEARNING PATH FORMAT ===
When user wants to learn something:

## 🎯 [Topic] Learning Path

**Duration:** X weeks | **Level:** Beginner

### 📅 Week 1: [Topic]
- 📚 **শিখবে:** [What to learn]
- 🔗 **Resources:** [YouTube/Website links]
- ✅ **Practice:** [Task]

### 📅 Week 2: [Topic]
[Continue...]

### 🏆 Projects
1. Week X: [Project]
2. Final: [Capstone]

=== QUIZ FORMAT ===
## 📝 Quiz: [Topic]

### Q1 (MCQ)
**[Question]**

A) Option A
B) Option B
C) Option C
D) Option D

<details><summary>✅ Answer</summary>

**Correct:** B) Option B

**কেন:** [Brief explanation]

</details>

=== RULES ===
- Jump straight to content, no fluff
- Use beautiful markdown formatting
- Be helpful and encouraging
- Remember user's context
- Match user's language (Bengali/English)`;


    // Fetch user memory
    const userMemory = await getUserMemory(supabase, userId, deviceFingerprint);
    const memoryContext = formatMemoryContext(userMemory);
    
    // Detect mood from the latest user message
    const latestUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (latestUserMessage) {
      const detectedMood = detectMood(latestUserMessage.content);
      if (detectedMood) {
        // Only update if mood changed
        if (!userMemory?.last_mood || userMemory.last_mood !== detectedMood) {
          await updateUserMemory(supabase, userId, deviceFingerprint, {
            last_mood: detectedMood
          });
          console.log(`Mood detected and saved: ${detectedMood}`);
        }
      }
    }
    
    // Combine system prompt with memory context
    const fullSystemPrompt = systemPrompt + memoryContext;

    // Build messages with image support
    const formattedMessages = messages.map((msg: any) => {
      if (msg.role === "user" && imageUrls && imageUrls.length > 0) {
        // Check if this is the last user message (the one with images)
        const isLastUserMessage = messages.indexOf(msg) === messages.length - 1;
        if (isLastUserMessage) {
          const content: any[] = [{ type: "text", text: msg.content }];
          imageUrls.forEach((url: string) => {
            content.push({
              type: "image_url",
              image_url: { url }
            });
          });
          return { role: msg.role, content };
        }
      }
      return msg;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...formattedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error occurred." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Learning chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
