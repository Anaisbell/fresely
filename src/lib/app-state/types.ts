import type { z } from "zod";
import type {
  AppPantrySchema,
  AppPreferencesSchema,
  AppSetupSchema,
  FreselyAppStateSchema,
  LatestRecommendationSchema,
} from "./schema";

export type AppSetup = z.infer<typeof AppSetupSchema>;
export type AppPreferences = z.infer<typeof AppPreferencesSchema>;
export type AppPantry = z.infer<typeof AppPantrySchema>;
export type LatestRecommendation = z.infer<
  typeof LatestRecommendationSchema
>;
export type FreselyAppState = z.infer<typeof FreselyAppStateSchema>;

