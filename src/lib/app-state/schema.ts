import { z } from "zod";
import {
  DinnerRecommendationSchema,
  GenerateDinnerRequestSchema,
} from "@/lib/dinner/schema";

export const APP_STATE_VERSION = 1 as const;

export const AppSetupSchema = z.object({
  completedAt: z.string().datetime(),
});

export const AppPreferencesSchema = z.object({
  firstName: z.string().trim().max(60).default(""),
  cultures: z.array(z.string().trim().min(1).max(80)).min(1).max(12),
  restrictions: z.array(z.string().trim().min(1).max(120)).max(20),
  defaultServings: z.number().int().min(1).max(12),
});

export const AppPantrySchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(120)).max(40),
  updatedAt: z.string().datetime(),
});

export const LatestRecommendationSchema = z.object({
  recommendation: DinnerRecommendationSchema,
  generatedAt: z.string().datetime(),
  madeAt: z.string().datetime().nullable().default(null),
  request: GenerateDinnerRequestSchema,
});

export const FreselyAppStateSchema = z.object({
  version: z.literal(APP_STATE_VERSION),
  setup: AppSetupSchema,
  preferences: AppPreferencesSchema,
  pantry: AppPantrySchema,
  latestRecommendation: LatestRecommendationSchema.nullable(),
});
