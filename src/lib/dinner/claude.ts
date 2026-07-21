import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { DinnerRecommendationContentSchema, DinnerRecommendationSchema } from "./schema";
import { buildDinnerPrompt, DINNER_SYSTEM_PROMPT } from "./prompt";
import type { DinnerRecommendation, GenerateDinnerRequest } from "./types";

// AI-generated path for "Made for Your Roots". This only runs when no
// curated anchor recipe matched the request (see anchor-recipes/select.ts
// and generate.ts, which decide that before this function is ever called).
export async function generateDinnerRecommendation(
  input: GenerateDinnerRequest,
): Promise<DinnerRecommendation> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL;

  if (!apiKey || !model) {
    throw new Error("Claude is not configured");
  }

  const anthropic = new Anthropic({ apiKey });
  const message = await anthropic.messages.parse({
    model,
    max_tokens: 1800,
    system: DINNER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildDinnerPrompt(input) }],
    output_config: {
      // The model only ever produces recipe content, never `source` — the
      // app decides that, not Claude.
      format: zodOutputFormat(DinnerRecommendationContentSchema),
    },
  });

  if (!message.parsed_output) {
    throw new Error("Claude returned no structured recommendation");
  }

  return DinnerRecommendationSchema.parse({
    ...message.parsed_output,
    source: "ai",
  });
}
