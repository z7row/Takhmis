"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatShortDay } from "@/lib/dates";

type Day = { day: string; done: number; total: number };

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Day;
  return (
    <div className="rounded-[4px] border border-border bg-card px-3 py-2 text-[12px] shadow-none">
      <p className="font-[family-name:var(--font-mono)] text-primary">{formatShortDay(d.day)}</p>
      <p className="mt-1 text-foreground">عملت: <span className="num text-primary">{d.done}</span></p>
      <p className="text-muted-foreground">المفروض: <span className="num">{d.total}</span></p>
    </div>
  );
}

export function ActivityChart({ days }: { days: Day[] }) {
  const data = days.map((d) => ({ ...d, name: formatShortDay(d.day) }));
  return (
    <div className="rounded-[6px] border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 border-b border-border/60 pb-3">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-primary">النشاط</p>
        <h2 className="mt-1 text-[24px] font-bold">تقدمك خلال الأيام</h2>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(58,69,62,0.35)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#9C9684', fontSize: 11 }} axisLine={{ stroke: '#3A453E' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#9C9684', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ stroke: '#A7BD71', strokeOpacity: 0.25 }} />
            <Line type="monotone" dataKey="total" name="المفروض" stroke="#3A453E" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="done" name="عملت" stroke="#A7BD71" strokeWidth={3} dot={{ r: 3, fill: '#A7BD71', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#FFFE88' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-muted-foreground">
        <span className="flex items-center gap-2"><span className="inline-block h-0.5 w-5 bg-primary" /> عملت</span>
        <span className="flex items-center gap-2"><span className="inline-block h-0.5 w-5 bg-border" /> المفروض</span>
      </div>
    </div>
  );
}
