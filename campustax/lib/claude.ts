import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  default: "claude-sonnet-4-6" as const,
  reasoning: "claude-opus-4-7" as const,
};
