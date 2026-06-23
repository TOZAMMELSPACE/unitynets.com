// Content moderation edge function for UnityNets.
// Uses Lovable AI Gateway (Gemini) to detect inappropriate content:
// nudity / sexual content, graphic violence / gore, hate speech, harassment,
// self-harm, illegal activity, terrorism, spam / scams.
//
// Request body:
//   { type: "text", content: string }
//   { type: "image", imageBase64: string, mimeType?: string }
//
// Response:
//   { allowed: boolean, reason: string, categories: string[], severity: "low"|"medium"|"high" }

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a strict content moderator for UnityNets, a global peace-building social platform for youth.

Your job is to detect any of the following "garbage" content and BLOCK it:
- Nudity, sexual / pornographic content, sexual solicitation
- Graphic violence, gore, blood, weapons used to threaten
- Hate speech, slurs, racism, religious incitement, sectarian attacks
- Harassment, bullying, doxxing, threats
- Self-harm or suicide promotion
- Illegal activity (drugs, weapons sale, human trafficking)
- Terrorism, extremism, violent ideology
- Spam, scams, phishing, crypto-pump, fake giveaways
- Misinformation that incites violence between countries / communities
- Graphic medical / disturbing imagery without context

ALLOW: normal social posts, opinions, debate, education, art, news, food, travel, memes that are not hateful, mild profanity used non-aggressively.

Respond with ONLY a compact JSON object, no markdown, no prose:
{"allowed": boolean, "reason": "short user-facing reason in English", "categories": ["category1"], "severity": "low"|"medium"|"high"}

If allowed=true, reason should be "" and categories should be [].`;

async function moderateText(content: string) {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Moderate this text post:\n\n"""${content}"""` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  return parseModeration(data?.choices?.[0]?.message?.content);
}

async function moderateImage(imageBase64: string, mimeType: string) {
  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Moderate this image. Apply the same blocking rules." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  return parseModeration(data?.choices?.[0]?.message?.content);
}

function parseModeration(raw: unknown) {
  let parsed: any = {};
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    // Fall back: if model returned non-JSON, be safe and allow but log.
    parsed = { allowed: true, reason: "", categories: [], severity: "low" };
  }
  return {
    allowed: parsed.allowed !== false,
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    severity: ["low", "medium", "high"].includes(parsed.severity) ? parsed.severity : "low",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing LOVABLE_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const type = body?.type;

    let result;
    if (type === "text") {
      const content = String(body?.content ?? "").slice(0, 8000);
      if (!content.trim()) {
        return new Response(
          JSON.stringify({ allowed: true, reason: "", categories: [], severity: "low" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      result = await moderateText(content);
    } else if (type === "image") {
      const imageBase64 = String(body?.imageBase64 ?? "");
      if (!imageBase64) {
        return new Response(
          JSON.stringify({ error: "imageBase64 is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      result = await moderateImage(imageBase64, String(body?.mimeType ?? "image/jpeg"));
    } else {
      return new Response(
        JSON.stringify({ error: "type must be 'text' or 'image'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("moderate-content error:", err);
    // Fail-open with a soft allow so the platform doesn't break on AI outages,
    // but flag it so the client can decide.
    return new Response(
      JSON.stringify({
        allowed: true,
        reason: "",
        categories: [],
        severity: "low",
        degraded: true,
        error: String(err?.message ?? err),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
