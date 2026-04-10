"use client";

import { useState } from "react";
import { AssetMatchItem } from "@/types/geoland";
import { HERO_METRICS_CONFIG, STRATEGY_COLORS, STRATEGY_LABELS } from "./layer2.config";

// ─── Helpers de formato ───────────────────────────────────────────────────────
function formatValue(value: number | undefined | null, format: string): string {
  if (value === undefined || value === null) return "—";
  switch (format) {
    case "percent":  return `${(value * (value < 1 ? 100 : 1)).toFixed(1)}%`;
    case "currency": return value > 1000
      ? `€${(value / 1000).toFixed(0)}k`
      : `€${value.toFixed(0)}`;
    case "score":    return `${Math.round(value)}`;
    case "number":   return `${Math.round(value)}`;
    default:         return String(value);
  }
}

function getRiskLabel(score: number): { label: string; color: string } {
  if (score < 35) return { label: "Bajo",   color: "rgba(29,158,117,0.8)"  };
  if (score < 65) return { label: "Medio",  color: "rgba(186,117,23,0.8)"  };
  return             { label: "Alto",   color: "rgba(226,75,74,0.8)"   };
}

// ─── Módulo de métrica individual ─────────────────────────────────────────────
function MetricModule({ label, value, sub, showBar, barWidth }: {
  label: string; value: string; sub?: string; showBar?: boolean; barWidth?: number;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.25)",
      border: "0.5px solid rgba(255,255,255,0.09)",
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </div>
      <div style={{ fontSize: 19, fontWeight: 500, color: "#e8e6f0", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{sub}</div>}
      {showBar && barWidth !== undefined && (
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: "rgba(29,158,117,0.6)", borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

// ─── G-Score ring ─────────────────────────────────────────────────────────────
function GScoreRing({ score }: { score: number }) {
  const r = 12;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{
      background: "rgba(255,255,255,0.25)",
      border: "0.5px solid rgba(255,255,255,0.09)",
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em" }}>G-Score</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(127,119,221,0.7)"
            strokeWidth="3" strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={circ * 0.25} strokeLinecap="round" />
        </svg>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#AFA9EC" }}>{Math.round(score)}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>/100</div>
        </div>
      </div>
    </div>
  );
}

// ─── Galería ─────────────────────────────────────────────────────────────────
function GalleryModule({ photos }: { photos?: string[] }) {
  const [current, setCurrent] = useState(0);
  const total = photos?.length || 4;
  return (
    <div style={{
      background: "rgba(255,255,255,0.24)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        flex: 1,
        minHeight: 90,
        background: "linear-gradient(135deg, rgba(60,50,120,0.35), rgba(20,30,60,0.55))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {photos?.[current]
          ? <img src={photos[current]} alt={`foto ${current + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.05em" }}>foto {current + 1} / {total}</span>
        }
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 6, borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11 }}>{"<"}</button>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 12 : 5,
            height: 5,
            borderRadius: i === current ? 2 : "50%",
            background: i === current ? "rgba(175,169,236,0.7)" : "rgba(255,255,255,0.2)",
            cursor: "pointer",
            transition: "all 0.2s",
          }} />
        ))}
        <button onClick={() => setCurrent(Math.min(total - 1, current + 1))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11 }}>{">"}</button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Layer2Capa0Hero({ asset }: { asset: AssetMatchItem }) {
  const estrategia = (asset.estrategia as string) || "FIX_FLIP";
  const config = HERO_METRICS_CONFIG[estrategia] || HERO_METRICS_CONFIG.FIX_FLIP;
  const stratColor = STRATEGY_COLORS[estrategia] || STRATEGY_COLORS.FIX_FLIP;
  const stratLabel = STRATEGY_LABELS[estrategia] || estrategia;
  const risk = getRiskLabel(asset.risk_score || 50);

  const getVal = (field: string) => (asset as Record<string, unknown>)[field] as number | undefined;

  return (
    <div style={{ background: "transparent" }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px 8px",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.22)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e6f0", marginBottom: 2 }}>
            {asset.nombre || asset.ciudad || "Activo sin nombre"}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {asset.ciudad} · {asset.pais || ""} · ID: {asset.id?.slice(0, 8)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{
            background: stratColor,
            border: `0.5px solid ${stratColor.replace("0.3", "0.5")}`,
            color: "#e8e6f0",
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
          }}>
            {stratLabel}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
            {Math.round((asset.confidence_final || 0) * 100)}% fidelidad
          </span>
        </div>
      </div>

      {/* Grid: izquierda | galería | derecha */}
      <div style={{ display: "grid", gridTemplateColumns: "108px 1fr 108px", gap: 8, padding: "10px 12px" }}>
        {/* Columna izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <MetricModule
            label={config.topLeft.label}
            value={formatValue(getVal(config.topLeft.field), config.topLeft.format)}
            showBar
            barWidth={Math.min(100, (getVal(config.topLeft.field) || 0) * (config.topLeft.format === "percent" ? 500 : 1))}
          />
          <MetricModule
            label={config.bottomLeft.label}
            value={`${formatValue(getVal(config.bottomLeft.field), config.bottomLeft.format)}`}
            sub={risk.label}
          />
        </div>

        {/* Galería central */}
        <GalleryModule photos={asset.photo_urls} />

        {/* Columna derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <GScoreRing score={asset.g_score || 0} />
          <MetricModule
            label={config.bottomRight.label}
            value={formatValue(getVal(config.bottomRight.field), config.bottomRight.format)}
          />
        </div>
      </div>

      {/* Descripción */}
      <div style={{
        padding: "0 12px 10px",
        fontSize: 10,
        color: "rgba(255,255,255,0.35)",
        lineHeight: 1.6,
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
        paddingTop: 8,
      }}>
        {asset.descripcion || `Activo en ${asset.ciudad} — estrategia ${stratLabel}.`}
        <span style={{ marginLeft: 8, color: "rgba(127,119,221,0.6)" }}>
          Confianza {Math.round((asset.confidence_final || 0) * 100)}%
        </span>
      </div>
    </div>
  );
}
