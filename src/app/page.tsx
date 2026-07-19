import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SETUP_COOKIE_NAME } from "@/lib/app-state/setup";

export default async function EntryPage() {
  const setupCookie = (await cookies()).get(SETUP_COOKIE_NAME);
  const setupComplete = setupCookie?.value === "1";

  redirect(setupComplete ? "/home" : "/welcome");
}
