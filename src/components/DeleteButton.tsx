"use client";

import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/icons";

function Inner({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-60"
    >
      <TrashIcon width={16} height={16} />
      {pending ? "Eliminando…" : label}
    </button>
  );
}

export function DeleteButton({
  action,
  id,
  label = "Eliminar",
  confirmText = "¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  label?: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Inner label={label} />
    </form>
  );
}
