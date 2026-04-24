import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODELS } from "@/lib/claude";
import { buildExtractPrompt } from "@/lib/prompts/extract";
import { W2Schema } from "@/lib/schemas/w2";
import { Form1098TSchema } from "@/lib/schemas/1098t";
import { Form1042SSchema } from "@/lib/schemas/1042s";
import { z } from "zod";

// Convert a Zod schema to a JSON Schema object compatible with Claude's tool use API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInputSchema(schema: z.ZodObject<any>): { type: "object"; properties: Record<string, unknown>; required?: string[] } {
  const shape = schema.shape;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    const field = value as z.ZodTypeAny;
    const isOptional = field instanceof z.ZodOptional;
    const innerField = isOptional ? (field as z.ZodOptional<z.ZodTypeAny>).unwrap() : field;
    const description = (innerField as z.ZodTypeAny & { description?: string }).description;

    if (innerField instanceof z.ZodNumber) {
      properties[key] = { type: "number", ...(description ? { description } : {}) };
    } else if (innerField instanceof z.ZodBoolean) {
      properties[key] = { type: "boolean", ...(description ? { description } : {}) };
    } else {
      properties[key] = { type: "string", ...(description ? { description } : {}) };
    }

    if (!isOptional) required.push(key);
  }

  return { type: "object", properties, ...(required.length > 0 ? { required } : {}) };
}

const FORM_SCHEMAS: Record<string, { schema: { type: "object"; properties: Record<string, unknown>; required?: string[] }; label: string }> = {
  w2: { schema: buildInputSchema(W2Schema), label: "W-2 Wage and Tax Statement" },
  "1098t": { schema: buildInputSchema(Form1098TSchema), label: "Form 1098-T Tuition Statement" },
  "1042s": { schema: buildInputSchema(Form1042SSchema), label: "Form 1042-S Foreign Person's US Source Income" },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const formType = formData.get("formType") as string | null;

  if (!file || !formType) {
    return NextResponse.json({ error: "Missing file or formType" }, { status: 400 });
  }

  const schemaEntry = FORM_SCHEMAS[formType];
  if (!schemaEntry) {
    return NextResponse.json({ error: `Unknown formType: ${formType}` }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = file.type as "application/pdf" | "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const message = await anthropic.messages.create({
    model: MODELS.default,
    max_tokens: 1024,
    tools: [
      {
        name: "return_extracted_fields",
        description: `Extract all fields from the ${schemaEntry.label}`,
        input_schema: schemaEntry.schema,
      },
    ],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: buildExtractPrompt(schemaEntry.label),
          },
          mediaType === "application/pdf"
            ? {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64,
                },
              }
            : {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
        ],
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "Extraction failed — Claude did not return structured data" }, { status: 500 });
  }

  return NextResponse.json({ data: toolUse.input, formType });
}
