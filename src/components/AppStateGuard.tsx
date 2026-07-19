"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SETUP_COOKIE_NAME } from "@/lib/app-state/setup";
import { readOrMigrateAppState } from "@/lib/app-state/storage";

const SETUP_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function setSetupCookie(): void {
  document.cookie = `${SETUP_COOKIE_NAME}=1; Path=/; Max-Age=${SETUP_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearSetupCookie(): void {
  document.cookie = `${SETUP_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function AppStateGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const recovery = readOrMigrateAppState();

    if (recovery.status === "ready") {
      setSetupCookie();
      // Durable storage is an external browser system and is checked after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }

    clearSetupCookie();
    router.replace(recovery.route);
  }, [router]);

  if (!ready) return null;
  return children;
}

