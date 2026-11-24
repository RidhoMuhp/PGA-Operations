"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

export default function BarcodeGraphic({
  value,
  compact = false,
}: {
  value: string;
  compact?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      displayValue: false,
      width: compact ? 1.5 : 2,
      height: compact ? 42 : 64,
      margin: 6,
      lineColor: "#10233f",
      background: "#ffffff",
    });
  }, [compact, value]);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={`Barcode Code 128 ${value}`}
      className="block h-auto max-w-full"
    />
  );
}
