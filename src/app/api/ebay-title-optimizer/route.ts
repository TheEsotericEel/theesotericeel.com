import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { title: input } = await req.json();

  const basePrompt = (data: string) => `
You are an expert eBay seller. Given the following input, create a single eBay title for a listing.

RULES:
- Title must be between 75 and 80 characters (count spaces and punctuation).
- Do not use ALL CAPS except acronyms.
- No word repetition.
- Prioritize high-volume keywords and most relevant information.
- Write in natural English, not just a keyword list.
- Return only the title and nothing else.

Input:
${data}
`;

  const MAX_ATTEMPTS = 6;
  let result = "";
  let bestEffort = "";
  let bestEffortDiff = 1000;
  let i = 0;
  const logs: string[] = [];

  while (i < MAX_ATTEMPTS) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: basePrompt(input) }],
      max_tokens: 60,
      temperature: 0.7,
    });

    const aiTitle = completion.choices[0]?.message?.content?.replace(/\s+/g, " ").trim() || "";

    logs.push(`Attempt #${i + 1}: "${aiTitle}" (length: ${aiTitle.length})`);

    if (aiTitle.length >= 75 && aiTitle.length <= 80) {
      logs.push("✔️ Valid title found in range!");
      result = aiTitle;
      break;
    } else {
      const diff = Math.abs(aiTitle.length - 77);
      if (diff < bestEffortDiff && aiTitle.length > 0) {
        bestEffort = aiTitle;
        bestEffortDiff = diff;
      }
    }
    i++;
  }

  if (!result) {
    if (bestEffort.length > 80) {
      logs.push("✂️ Trimming best effort to 80 characters.");
      result = bestEffort.slice(0, 80).trim();
    } else if (bestEffort.length > 0) {
      logs.push("⚠️ Using closest best effort, not within range.");
      result = bestEffort;
    } else {
      logs.push("❌ No valid title generated.");
      result = "Could not generate a title in 75-80 characters. Try different input.";
    }
  }

  logs.push(`Final output: "${result}" (length: ${result.length})`);

  return NextResponse.json({ optimized: result, logs });
}
