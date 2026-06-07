"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { classNames } from "@/lib/utils";

type WeightUnit = "kg" | "lb";

// Conmutador de unidad de peso. Guarda la preferencia en una cookie legible por
// el servidor y refresca para que los componentes server re-rendericen.
export function UnitToggle({ initial }: { initial: WeightUnit }) {
  const router = useRouter();
  const [unit, setUnit] = useState<WeightUnit>(initial);

  function choose(next: WeightUnit) {
    if (next === unit) return;
    setUnit(next);
    document.cookie = `weight_unit=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
      {(["lb", "kg"] as WeightUnit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => choose(u)}
          className={classNames(
            "rounded-md px-2.5 py-1 transition",
            unit === u
              ? "bg-white text-brand-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
          aria-pressed={unit === u}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
