import { z } from "zod";

const aiResponseSchema = z.object({
  faceType: z.string(),
  concerns: z.array(z.string()),
  summary: z.string(),
  recommendedProductSlugs: z.array(
    z.enum(["cleanser", "toner", "serum", "moisturizer"])
  ),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

export type AiVisionResult = z.infer<typeof aiResponseSchema>;

export function isAiVisionEnabled() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function analyzeFaceWithAI(
  imageBuffer: Buffer,
  context: { age?: number; gender?: string; userNotes?: string }
): Promise<AiVisionResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini";
  const base64 = imageBuffer.toString("base64");
  const mime = "image/jpeg";

  const systemPrompt = `You are a skincare advisor for Glow Diaries healthcare products (non-diagnostic, cosmetic guidance only).
Analyze the face photo and return ONLY valid JSON with this shape:
{
  "faceType": "Oily | Dry | Combination | Sensitive | Normal",
  "concerns": ["acne","dryness",...],
  "summary": "2-4 sentences about visible skin characteristics and care approach",
  "recommendedProductSlugs": ["cleanser","toner","serum","moisturizer"],
  "confidence": "low|medium|high"
}
Pick 2-4 product slugs from: cleanser, toner, serum, moisturizer. Always include cleanser unless clearly inappropriate.
Do not claim medical diagnosis.`;

  const userText = [
    context.userNotes ? `User notes: ${context.userNotes}` : null,
    context.age ? `Age: ${context.age}` : null,
    context.gender ? `Gender: ${context.gender}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userText || "Analyze this face photo for skincare guidance.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mime};base64,${base64}`,
                  detail: "low",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI vision error", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") return null;

    const parsed = aiResponseSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      console.error("AI response parse failed", parsed.error);
      return null;
    }
    return parsed.data;
  } catch (e) {
    console.error("AI vision request failed", e);
    return null;
  }
}
