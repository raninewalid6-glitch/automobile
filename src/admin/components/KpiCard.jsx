import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function KpiCard({ title, value, icon: Icon, helper, tone = "red" }) {
  const toneClasses = {
    red: "from-red-600/20 to-orange-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    orange: "from-orange-500/20 to-red-600/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    slate: "from-black/10 dark:from-white/10 to-black/5 dark:to-white/5 text-gray-400 dark:text-gray-200 border-black/10 dark:border-white/10",
  };

  return (
    <article className="group rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-red-500/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
        </div>
        <div
          className={`rounded-2xl border bg-gradient-to-br p-3 ${
            toneClasses[tone] ?? toneClasses.red
          }`}
        >
          {React.createElement(Icon, { className: "h-6 w-6" })}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <ArrowUpRight className="h-4 w-4 text-orange-400" />
        <span>{helper}</span>
      </div>
    </article>
  );
}
