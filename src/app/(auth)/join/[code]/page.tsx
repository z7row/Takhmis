import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowLeft, LogIn } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { checkInvite } from "@/lib/invites";
import { RegisterFlow } from "@/components/auth/register-flow";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "دعوة للشلة",
};

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  const { code } = await params;
  const invite = checkInvite(decodeURIComponent(code));

  if (!invite.valid) {
    return (
      <div className="rounded-[10px] border border-border bg-card p-6 text-center">
        <div className="mb-5 flex justify-center">
          <Logo size="lg" href={null} />
        </div>
        <span className="mx-auto grid size-12 place-items-center rounded-[4px] border border-border bg-accent/15">
          <AlertCircle className="size-5 text-primary" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">الدعوة دي مش شغالة</h1>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-muted-foreground/70">
          {invite.reason}
        </p>
        <p className="mt-2 font-display text-[11px] tracking-[0.2em] text-muted-foreground/70">
          {invite.code}
        </p>

        <div className="mt-6 space-y-2">
          <Button asChild className="h-9 w-full rounded-[4px]">
            <Link href="/register">
              أدخل كود تاني
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9 w-full rounded-[4px]">
            <Link href="/login">
              <LogIn className="size-4" />
              عندي حساب بالفعل
            </Link>
          </Button>
        </div>

        <p className="mt-5 text-[11px] text-muted-foreground/70">
          كلّم الأدمن عشان يبعتلك دعوة جديدة.
        </p>
      </div>
    );
  }

  return (
    <RegisterFlow
      defaultCode={invite.code}
      lockCode
      inviteNote={invite.note}
      inviterName={invite.inviterName}
    />
  );
}
