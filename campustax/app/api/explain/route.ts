import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODELS } from "@/lib/claude";
import { buildExplainPrompt } from "@/lib/prompts/explain";
import { unstable_cache } from "next/cache";
import * as fs from "fs";
import * as path from "path";

const INSTRUCTIONS_MAP: Record<string, string> = {
  "1040": "public/forms/i1040.pdf",
  "1040nr": "public/forms/i1040nr.pdf",
  "8843": "public/forms/i8843.pdf",
  "md502": "public/forms/md-resident-booklet.pdf",
  "md505": "public/forms/md-nonresident-booklet.pdf",
};

async function getExplanation(params: {
  formId: string;
  lineNumber: string;
  lineLabel: string;
  currentValue?: string;
  filerType: "resident" | "nonresident";
}): Promise<string> {
  const { formId } = params;
  const instructionsPath = INSTRUCTIONS_MAP[formId];

  const messageContent: Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"] = [
    { type: "text", text: buildExplainPrompt(params) },
  ];

  // Attach instructions PDF if available
  if (instructionsPath) {
    const absPath = path.join(process.cwd(), instructionsPath);
    if (fs.existsSync(absPath)) {
      const pdfBytes = fs.readFileSync(absPath);
      const base64 = pdfBytes.toString("base64");
      messageContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      });
    }
  }

  const response = await anthropic.messages.create({
    model: MODELS.default,
    max_tokens: 512,
    messages: [{ role: "user", content: messageContent }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "No explanation available.";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { formId, lineNumber, lineLabel, currentValue, filerType } = body;

  if (!formId || !lineNumber || !lineLabel) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const getCached = unstable_cache(
    () => getExplanation({ formId, lineNumber, lineLabel, currentValue, filerType: filerType ?? "resident" }),
    [`explain-${formId}-${lineNumber}`],
    { revalidate: 86400 }
  );

  const explanation = await getCached();
  return NextResponse.json({ explanation });
}
