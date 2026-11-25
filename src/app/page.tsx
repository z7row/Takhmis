import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getCurrentUser();
  redirect(user ? "/feed" : "/login");
}
