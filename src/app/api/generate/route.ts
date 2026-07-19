import { generateDinnerRecommendation } from "@/lib/dinner/claude";
import { GenerateDinnerRequestSchema } from "@/lib/dinner/schema";

export const runtime = "nodejs";

function errorResponse(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

function developmentCause(error: unknown): string {
  if (process.env.NODE_ENV !== "development") return "";

  if (error instanceof Error) {
    return ` Development cause: ${error.message}`;
  }

  return ` Development cause: ${String(error)}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "The request body must be valid JSON.", 400);
  }

  const parsed = GenerateDinnerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Complete each onboarding step before generating dinner.",
      400,
    );
  }

  try {
    const recommendation = await generateDinnerRecommendation(parsed.data);
    return Response.json({ recommendation });
  } catch (error) {
    console.error("Dinner generation failed", error);
    const unconfigured =
      error instanceof Error && error.message === "Claude is not configured";
    const message = unconfigured
      ? "Dinner generation is not configured yet."
      : "Dinner could not be generated. Please try again.";

    return errorResponse(
      unconfigured ? "GENERATOR_NOT_CONFIGURED" : "GENERATION_FAILED",
      `${message}${developmentCause(error)}`,
      unconfigured ? 503 : 502,
    );
  }
}
