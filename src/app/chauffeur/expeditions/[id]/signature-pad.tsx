"use client";

import { useRef, useState } from "react";

// Pad de signature minimaliste, sans dépendance externe : un canvas suivant
// les événements pointer (souris/tactile unifiés), exporté en Blob PNG au
// moment de la soumission. `onChange` reçoit `null` tant que rien n'est
// dessiné (le champ signature reste optionnel côté formulaire appelant).
export default function SignaturePad({ onChange }: { onChange: (blob: Blob | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    const p = point(e);
    if (!ctx || !p) return;
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = point(e);
    if (!ctx || !p) return;
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#182235";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.stroke();
    if (empty) setEmpty(false);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    canvasRef.current?.toBlob((blob) => onChange(blob), "image/png");
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <canvas
        ref={canvasRef}
        width={400}
        height={160}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded-lg border border-border-input bg-white"
        style={{ height: 160 }}
      />
      {!empty && (
        <button type="button" onClick={clear} className="self-start text-xs text-ink-muted hover:text-ink">
          Effacer la signature
        </button>
      )}
    </div>
  );
}
