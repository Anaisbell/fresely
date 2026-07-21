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
  const outputFormat = zodOutputFormat(DinnerRecommendationContentSchema);
  const maxTokens = 6000;

  // TEMP DEBUG (truncation investigation): using .create() + manual parsing
  // instead of .parse() so the raw Message — stop_reason, usage — is
  // observable on every call, including failures. .parse() calls this same
  // parse function internally, but from inside a step that only returns the
  // parsed_output; if parsing throws, the Message it had in hand (with
  // stop_reason/usage) is discarded along with it, never reaching caller
  // code. Remove this instrumentation once the intermittent truncation
  // failure mode is understood; the schema's own declared maximums
  // (title/rationale/caution length, up to 40+30 ingredients, up to 12
  // steps at 600 chars each) sum to roughly 4,300-4,900 tokens worst case
  // IF the model respects them — but per the Anthropic SDK's
  // transform-json-schema step, minLength/maxLength/maxItems are never sent
  // as enforced constraints, only folded into the field description as a
  // soft hint. So there is no hard ceiling on output length below
  // max_tokens itself; raising max_tokens (1800 -> 6000) makes truncation
  // rarer, not impossible.
  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: DINNER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildDinnerPrompt(input) }],
    output_config: {
      // The model only ever produces recipe content, never `source` — the
      // app decides that, not Claude.
      format: outputFormat,
    },
  });

  const rawText = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  console.log(
    "[dinner:generate] model=%s max_tokens=%d stop_reason=%s input_tokens=%s output_tokens=%d thinking_tokens=%s raw_length=%d",
    model,
    maxTokens,
    message.stop_reason,
    message.usage.input_tokens,
    message.usage.output_tokens,
    message.usage.output_tokens_details?.thinking_tokens ?? "n/a",
    rawText.length,
  );

  let parsedContent: ReturnType<typeof outputFormat.parse>;
  try {
    parsedContent = outputFormat.parse(rawText);
  } catch (error) {
    console.error(
      "[dinner:generate] FAILED stop_reason=%s output_tokens=%d/%d raw_length=%d",
      message.stop_reason,
      message.usage.output_tokens,
      maxTokens,
      rawText.length,
    );
    console.error("[dinner:generate] raw text tail (last 300 chars):", rawText.slice(-300));
    throw error;
  }

  return DinnerRecommendationSchema.parse({
    ...parsedContent,
    source: "ai",
  });
}
