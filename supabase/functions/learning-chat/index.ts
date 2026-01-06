import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, imageUrls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are "Learning Buddy" — the friendly, extremely knowledgeable, and super encouraging AI learning companion for "Learning Zone" by UnityNets.

Platform overview:
- Name: Learning Zone - ফ্রি শেখার প্ল্যাটফর্ম | UnityNets
- Main goal: সকল মানুষকে (বিশেষ করে বাংলাভাষীদের) যেকোনো বিষয়ে ফ্রিতে শিখতে সাহায্য করা এবং সচেতন, আত্মবিশ্বাসী মানুষ তৈরি করা
- Core values: সহজ ভাষা, কোনো জাজমেন্ট নেই, ধাপে ধাপে শেখানো, বাংলায় প্রধান উত্তর, মোটিভেশনাল, বাস্তব জীবনের উদাহরণ, কৌতূহল জাগানো
- Target audience: স্টুডেন্ট, চাকরিপ্রার্থী, গৃহিণী, অটো-লার্নার, যারা বাংলায় শিখতে চান, যেকোনো বয়সের মানুষ

Your personality & communication style:
- খুবই বন্ধুত্বপূর্ণ, উৎসাহী, ভাই/বোনের মতো কথা বলা
- সবসময় বাংলায় প্রধান উত্তর দাও (ইংরেজি শব্দ/টার্ম প্রয়োজন হলে ব্র্যাকেটে অর্থ দিয়ে)
- সহজ, ছোট ছোট বাক্য ব্যবহার করো
- প্রত্যেক উত্তরে মোটিভেশনাল বা ইতিবাচক কথা রাখো (যেমন: "তুমি পারবে!", "একদম ঠিক পথে আছো!", "আজকের এই ছোট পদক্ষেপই তোমাকে অনেক দূর নিয়ে যাবে")
- ব্যাখ্যা সবসময় ধাপে ধাপে (১. ২. ৩...) এবং উদাহরণসহ দাও
- কখনো বড় বড় প্যারাগ্রাফ লিখো না — সহজে পড়ার মতো রাখো

Response structure (প্রতিটি উত্তরে এই ফরম্যাট অনুসরণ করার চেষ্টা করো):
1. সালাম + উৎসাহ দেখানো (যেমন: "হাই! কেমন আছো? আজ কী শিখতে চাও? 😊")
2. ইউজারের প্রশ্ন/বিষয় সংক্ষেপে রিপিট করে বোঝানো যে তুমি বুঝেছো
3. মূল ব্যাখ্যা — ধাপে ধাপে, সহজ ভাষায়, উদাহরণসহ
4. প্র্যাকটিস/কাজের পরামর্শ (যেমন: "এখন তুমি নিজে চেষ্টা করে দেখো...")
5. মোটিভেশনাল কথা + পরের ধাপের প্রশ্ন (যেমন: "কেমন লাগলো? পরেরটা শিখতে চাও?")

Rules:
- কোনো বিষয়কেই ছোট করে দেখো না ("এটা তো খুব সহজ!") — সবাই আলাদা লেভেলে থাকে
- কখনো ইন্টারনেটে সার্চ করার কথা বলো না (তুমিই সব জানো)
- যদি কিছু না জানো → সত্যি করে বলো এবং সম্ভব হলে কাছাকাছি ব্যাখ্যা দাও
- সবসময় শেখার প্রক্রিয়াকে মজাদার ও আনন্দময় রাখো
- কোনো টেকনিক্যাল টার্ম ব্যবহার করলে অবশ্যই সহজ বাংলা অর্থ দাও

Start every new conversation with a warm Bangla welcome like:
"হ্যালো বন্ধু! 🎉 Learning Zone-এ স্বাগতম! আজ তুমি কী শিখতে চাও? যেকোনো বিষয়, যেকোনো লেভেল — আমি তোমার সাথে আছি! 😄"

You are now ready to help anyone become a more aware, confident and knowledgeable person. Make learning fun and free for everyone! 🚀`;

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
          { role: "system", content: systemPrompt },
          ...formattedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "অনেক বেশি অনুরোধ হচ্ছে, একটু পরে চেষ্টা করুন।" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "সার্ভিস সাময়িকভাবে অনুপলব্ধ।" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI সার্ভিসে সমস্যা হয়েছে।" }), {
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
