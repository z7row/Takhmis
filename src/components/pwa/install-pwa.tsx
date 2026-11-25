"use client";

import { useEffect, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPwa() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setStandalone(isStandalone);

    const handler = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (standalone || dismissed) return null;

  const install = async () => {
    if (!prompt) {
      toast.info("على الآيفون: اضغط زر المشاركة ثم «إضافة للشاشة الرئيسية»", {
        icon: <Share2 className="size-4" />,
        duration: 7000,
      });
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      toast.success("تخميس اتثبّت على شاشتك 🎉");
      setPrompt(null);
    }
  };

  return (
    <div className="relative rounded-[10px] border border-border bg-card p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute end-3 top-3 rounded-xl p-1 text-muted-foreground/70 hover:bg-accent/10 hover:text-foreground"
        aria-label="إغلاق"
      >
        <X className="size-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[4px] border border-border bg-background">
          <Smartphone className="size-5 text-primary/70" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">ثبّت تخميس على شاشتك</p>
          <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground/70">
            افتحها في ثانية من غير متصفح، واستقبل كل جديد الشلة كأنها تطبيق.
          </p>
          <Button size="sm" onClick={install} className="mt-3 h-8 gap-1.5 rounded-[4px] px-3 text-[11px]">
            <Download className="size-3.5" />
            ثبّت التطبيق
          </Button>
        </div>
      </div>
    </div>
  );
}
