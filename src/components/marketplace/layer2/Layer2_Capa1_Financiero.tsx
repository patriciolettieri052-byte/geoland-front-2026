"use client";

import { motion } from "framer-motion";
import { AssetMatchItem } from "@/types/geoland";
import { FINANCIAL_VARS_CONFIG, normalizeStrategyKey } from "./layer2.config";

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
  const rawEstrategia = (asset.strategy || asset.estrategia || 'RENTAL_LONG_TERM') as string;
  const estrategia = normalizeStrategyKey(rawEstrategia);
  const vars = FINANCIAL_VARS_CONFIG[estrategia] || FINANCIAL_VARS_CONFIG.FIX_FLIP;
  const data = asset as Record<string, unknown>;

  // V7-FIX: moneda dinámica según mercado
  const mercado = ((asset as any).mercado || '').toLowerCase();
  const monedaLabel = mercado.includes('dubai') ? 'AED'
    : mercado.includes('miami') ? 'USD'
    : mercado.includes('buenos') || mercado.includes('ba') ? 'ARS'
    : 'EUR';

  return (
    <div style={{ padding: "24px", borderTop: "1px solid #E5E7EB", background: "#FFFFFF" }}>
      {/* Header de sección */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 12, background: "#000000", borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>
            Validación Financiera · Unit Economics
          </span>
        </div>
        <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>VALORES ESTIMADOS {monedaLabel}</span>
      </div>

      {/* Grid 4 Columnas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: 12 
      }}>
        {vars.map((v, i) => {
          const rawVal = data[v.field];
          const numVal = Number(rawVal);
          const barPct = v.showBar && v.barMax ? Math.max(0, Math.min(100, (numVal / v.barMax) * 100)) : 0;
          
          const isPos = v.positive === "high" ? numVal > 0
                      : v.positive === "low" && v.barMax ? numVal < v.barMax
                      : false;
          
          const valColor = v.positive
            ? (isPos ? "#16A34A" : "#DC2626")
            : "#0F1117";

          return (
            <div key={i} style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: "14px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800 }}>
                {v.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: valColor }}>
                {fmt(rawVal, v.format)}
              </div>
              {v.showBar && (
                <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 * i }}
                    style={{ height: "100%", background: v.positive ? valColor : "rgba(0,0,0,0.55)", borderRadius: 2 }} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
