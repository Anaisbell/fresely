import type {
  DinnerRecommendation,
  GenerateDinnerRequest,
} from "@/lib/dinner/types";
import { migrateLegacyState } from "./migration";
import { readAppState, writeAppState } from "./storage";
import type { FreselyAppState } from "./types";

export const SETUP_COOKIE_NAME = "fresely_setup";
const SETUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type CompleteSetupResult = {
  state: FreselyAppState;
  written: boolean;
};

function setSetupCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SETUP_COOKIE_NAME}=1; Path=/; Max-Age=${SETUP_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * Completes first-run setup after generation has produced a validated request
 * and recommendation. Repeated calls are idempotent and never overwrite an
 * existing valid durable state.
 */
export function completeSetupOnce(
  request: GenerateDinnerRequest,
  recommendation: DinnerRecommendation,
  completedAt = new Date(),
): CompleteSetupResult {
  const existing = readAppState();
  if (existing) {
    setSetupCookie();
    return { state: existing, written: false };
  }

  const migration = migrateLegacyState(request, recommendation, completedAt);
  if (!migration.state) {
    throw new Error("Validated setup data could not be persisted");
  }

  writeAppState(migration.state);
  setSetupCookie();
  return { state: migration.state, written: true };
}

