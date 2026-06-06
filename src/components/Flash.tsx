"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Lee ?notice= o ?error= de la URL y muestra un toast que se auto-oculta.
export function Flash() {
  const params = useSearchParams();
  const notice = params.get("notice");
  const error = params.get("error");
  const [visible, setVisible] = useState(false);
  const message = notice || error;
  const isError = Boolean(error);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 lg:left-64">
      <div
        className={`animate-slide-up pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          isError
            ? "bg-red-600 text-white"
            : "bg-slate-900 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
