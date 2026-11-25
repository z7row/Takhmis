import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { checkInvite } from "@/lib/invites";
import { RegisterFlow } from "@/components/auth/register-flow";
import { AlertCircle, ArrowLeft, LogIn } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "دخول الشلة",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  const params = await searchParams;
  const code = params.code?.trim().toUpperCase() ?? "";
  const invite = code ? checkInvite(code) : null;

  return (
    <RegisterFlow
      defaultCode={code}
      inviteNote={invite?.valid ? invite.note : null}
      inviterName={invite?.valid ? invite.inviterName : null}
    />
  );
}
