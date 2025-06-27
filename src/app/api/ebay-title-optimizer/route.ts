import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// === Insert your cheat-sheet as a string here ===
const EBAY_TITLE_CHEATSHEET = `
eBay Title-Ordering Cheat-Sheet (2025)
Use ≤ 80 characters, no emoji/ALL-CAPS, and mirror your Item Specifics. All patterns below are taken from current (Apr 2025) eBay Seller Center documentation and staff-moderated community guidelines only.

| Category          | Recommended token order*                                              | Approved / common acronyms†      |
|-------------------|-----------------------------------------------------------------------|----------------------------------|
| Clothing & Fashion| NEW → Brand → Gender/Dept → Item Type → Size → Color/Pattern → ...    | NWT, NWOT, EUC, HTF              |
| Footwear          | Brand → Model/Style → Gender → Size (US/EU) → Color → Condition       | NIB, NWOB, OEM                   |
| Phones / Tablets  | Brand → Model → Storage/RAM → Color → Carrier → Grade (A/B/Refurb)   | OEM, NOS                         |
| Laptops & Desktops| Brand → Model No. → CPU/RAM → Storage → GPU or Screen-size → Grade    | OEM                              |
| Motors Parts      | Part Name → OEM/MPN → Vehicle Make & Model (Year–Year) → ...          | OEM, NOS                         |
| Trading Cards     | Year → Brand/Set → Card # → Player/Character → Feature (RC, Auto) ... | PSA, BGS, SGC, RC, NM, GEM       |
| Books & Media     | Author → Title → Edition/Vol. → Format (HC, PB) → ISBN → Condition    | HC, PB, DJ, HCDJ, VG             |
| Jewelry & Watches | Metal Purity → Stone → Item Type → Carat/Weight → Brand → Size ...    | 14K, 925, VVS                    |
| Toys / Collectibles| Brand → Line/Series → Character → Scale/Size → Year → NRFB/HTF ...   | NRFB, HTF, MIB                   |
| Sports Equipment  | Brand → Model → Sport Type → Size/Weight → Material → Condition       | NOS, OEM                         |
*Only use allowed acronyms.
`;

const PROMPT_TEMPLATE = `
You are an expert eBay title optimizer. Follow these instructions exactly:

INSTRUCTIONS:
- Analyze the provided item details and generate an eBay listing title.
- Strictly use only the information given. NEVER invent brand, model, year, etc.
- Detect the most likely category and use the correct title pattern from the following table:
${EBAY_TITLE_CHEATSHEET}
- Do NOT use ALL CAPS except for allowed acronyms (see table).
- Do NOT use forbidden symbols (emoji, nonstandard punctuation, etc.).
- Never use "" or () or similar to surround titles. 
- The title must be between 75 and 80 characters (count spaces/punctuation).
- If under 75, pad naturally with relevant, factual keywords only. 
- If over 80, trim without removing key details.
- Never add quality/condition unless user gives it.
- Output ONLY the optimized title, in a code block. No comments, no explanations.
- If you cannot detect a category, respond: \`Unable to determine category. Please specify category.\`
`;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: Extract text from the first code block in a string
function extractCodeBlock(text: string): string | null {
  const match = text.match(/```(?:[\w-]*\n)?([\s\S]+?)```/);
  if (match) return match[1].trim();
  return null;
}

// Helper: Enforce rules (final layer of defense)
function enforceRules(title: string): string {
  // Remove forbidden characters
  const forbiddenRegex = /[^\w\s\-.,:/&+#']/g; // allow only these symbols and common title chars
  let clean = title.replace(forbiddenRegex, "");

  // Remove ALL CAPS words except allowed acronyms
  const allowedAcronyms = [
    "NWT","NWOT","EUC","HTF","NIB","NWOB","OEM","NOS","PSA","BGS",
    "SGC","RC","NM","GEM","HC","PB","DJ","HCDJ","VG","NRFB","MIB","VVS","14K","925"
  ];
  clean = clean.split(" ").map(word =>
    (word === word.toUpperCase() && word.length > 2 && !allowedAcronyms.includes(word))
      ? word.charAt(0) + word.slice(1).toLowerCase()
      : word
  ).join(" ");

  // De-dupe consecutive words
  clean = clean.replace(/\b(\w+)\s+\1\b/gi, "$1");

  // Trim to max 80, but don't cut off mid-word
  if (clean.length > 80) {
    clean = clean.slice(0, 80);
    // If we cut a word, remove partial
    clean = clean.replace(/\s+\S*$/, "");
  }

  return clean.trim();
}

export async function POST(req: NextRequest) {
  const { title: userInput } = await req.json();

  // Compose prompt
  const prompt = `${PROMPT_TEMPLATE}\nInput:\n${userInput}\n`;

  // Call OpenAI (gpt-4o, or gpt-4.1-mini)
  let aiResp;
  try {
    aiResp = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // replace with 4.1-mini model id when available/needed
      messages: [
        { role: "system", content: PROMPT_TEMPLATE },
        { role: "user", content: `Input:\n${userInput}\n` }
      ],
      max_tokens: 80,
      temperature: 0.6,
    });
  } catch (err) {
    return NextResponse.json({ optimized: "", logs: ["OpenAI API error: " + (err as any).message] }, { status: 500 });
  }

  // Parse AI output for code block
  let aiText = aiResp.choices[0]?.message?.content?.trim() || "";
  let result = extractCodeBlock(aiText) || aiText;

  // Enforce rules in code as final safety net
  result = enforceRules(result);

  // Character count check
  if (result.length < 75) {
    // Optionally, try again with extra "pad more" instruction, or just return best effort.
    // For now: pad with spaces to 75 (or you can loop/ask AI again for better result).
    result = result.padEnd(75, " ");
  }

  // If AI gave "unable to determine category" message, pass that through (user needs to clarify)
  if (result.startsWith("Unable to determine category")) {
    return NextResponse.json({ optimized: result });
  }

  // Done!
  return NextResponse.json({ optimized: result });
}
