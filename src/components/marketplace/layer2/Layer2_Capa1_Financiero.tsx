"use client";

import { AssetMatchItem } from "@/types/geoland";
import { FINANCIAL_VARS_CONFIG } from "./layer2.config";

function fmt(value: unknown, format: string): string {
  if (value === undefined || value === null) return "—";
  const n = Number(value);
  if (isNaN(n)) return String(value);
  switch (format) {
    case "percent":  return n < 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
    case "currency": return n > 999 ? `€${(n / 1000).toFixed(0)}k` : `€${n.toFixed(0)}`;
    case "number":   return String(Math.round(n));
    case "score":    return String(Math.round(n));
    default:         return String(value);
  }
}

export default function Layer2Capa1Financiero({ asset }: { asset: AssetMatchItem }) {
  const estrategia = (asset.estrategia as string) || "FIX_FLIP";
  const vars = FINANCIAL_VARS_CONFIG[estrategia] || FINANCIAL_VARS_CONFIG.FIX_FLIP;
  const data = asset as Record<string, unknown>;

  return (
    <div style={{ padding: "12px 12px 10px", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
      {/* Header de sección */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <div style={{ width: 2, height: 9, borderRadius: 1, background: "rgba(127,119,221,0.5)" }} />
        <span style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          Lógica financiera · {estrategia.replace(/_/g, " ")}
        </span>
      </div>

      {/* Grid 2×4 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {vars.map((v, i) => {
          const rawVal = data[v.field];
          const numVal = Number(rawVal);
          const barPct = v.showBar && v.barMax ? Math.min(100, (numVal / v.barMax) * 100) : 0;
          const isPos = v.positive === "high" ? numVal > 0 : v.positive === "low" ? numVal < (v.barMax || 999999) : false;
          const valColor = v.positive
            ? (isPos ? "rgba(29,158,117,0.9)" : "rgba(226,75,74,0.9)")
            : "#e8e6f0";

          return (
            <div key={i} style={{
              background: "rgba(255,255,255,0.44)",
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 7,
              padding: "7px 9px",
            }}>
              <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
                {v.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: valColor, marginTop: 1 }}>
                {fmt(rawVal, v.format)}
              </div>
              {v.showBar && (
                <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${barPct}%`, background: "rgba(127,119,221,0.5)", borderRadius: 2, transition: "width 0.4s" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
