"use client";

export default function PrintTrigger() {
  return (
    <button
      onClick={() => window.print()}
      className="mb-6 rounded-[10px] bg-navy px-5 py-2.5 text-sm font-semibold text-white print:hidden"
    >
      Imprimer / Enregistrer en PDF
    </button>
  );
}
