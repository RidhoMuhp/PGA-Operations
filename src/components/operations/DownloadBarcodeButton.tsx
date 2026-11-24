"use client";

import JsBarcode from "jsbarcode";
import { Download } from "lucide-react";
import { useState } from "react";

export default function DownloadBarcodeButton({
  value,
  fileName,
  compact = false,
}: {
  value: string;
  fileName: string;
  compact?: boolean;
}) {
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const downloadBarcode = () => {
    setFeedback(null);
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
      format: "CODE128",
      displayValue: true,
      width: 3,
      height: 100,
      margin: 18,
      fontSize: 24,
      textMargin: 8,
      lineColor: "#10233f",
      background: "#ffffff",
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        setFeedback({ success: false, message: "PNG barcode gagal dibuat. Coba unduh lagi." });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
      link.href = url;
      link.download = `${safeFileName || "barcode"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback({ success: true, message: "PNG barcode berhasil dibuat. Periksa folder unduhan." });
    }, "image/png");
  };

  return (
    <div>
      <button
        type="button"
        onClick={downloadBarcode}
        aria-label={`Unduh barcode Code 128 ${value} sebagai PNG`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700 font-semibold text-emerald-900 transition hover:bg-emerald-100 ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
      >
        <Download size={compact ? 14 : 16} />
        Unduh PNG
      </button>
      {feedback && (
        <p
          role="status"
          className={`mt-1 text-xs ${feedback.success ? "text-emerald-800" : "text-red-700"}`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
