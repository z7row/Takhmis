import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "تسجيل الدخول",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ nickname?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  const params = await searchParams;

  return <LoginForm initialNickname={params.nickname} />;
}
