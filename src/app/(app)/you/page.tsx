"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * "You" was renamed to "Settings" (src/app/(app)/settings/page.tsx). This
 * route is kept only as a lightweight redirect for anyone with /you
 * bookmarked, in browser history, or saved as a home-screen shortcut.
 */
export default function YouRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return null;
}
