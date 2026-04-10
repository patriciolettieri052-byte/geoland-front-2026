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
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#0F1117", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 9, color: "#6B7280", fontWeight: 500 }}>{sub}</div>}
      {showBar && barWidth !== undefined && (
        <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: "rgba(30,58,95,0.65)", borderRadius: 2 }} />
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
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 3,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>G-Score</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r={r} fill="none" stroke="#F3F4F6" strokeWidth="3" />
          <circle cx="16" cy="16" r={r} fill="none" stroke={score >= 80 ? "#16A34A" : "#D97706"}
            strokeWidth="3" strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={circ * 0.25} strokeLinecap="round" />
        </svg>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1117" }}>{Math.round(score)}</div>
          <div style={{ fontSize: 9, color: "#9CA3AF" }}>/100</div>
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
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 10,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        flex: 1,
        minHeight: 90,
        background: "#F3F4F6",  // placeholder cuando no hay foto
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {photos?.[current]
          ? <img src={photos[current]} alt={`foto ${current + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 10, color: "#9CA3AF", letterSpacing: "0.05em" }}>foto {current + 1} / {total}</span>
        }
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 6, borderTop: "1px solid #F3F4F6" }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{"<"}</button>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 14 : 6,
            height: 6,
            borderRadius: i === current ? 3 : "50%",
            background: i === current ? "#1E3A5F" : "#E5E7EB",
            cursor: "pointer",
            transition: "all 0.2s",
          }} />
        ))}
        <button onClick={() => setCurrent(Math.min(total - 1, current + 1))} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{">"}</button>
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
    <div style={{ background: "#FFFFFF", minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px 8px",
        borderBottom: "1px solid #E5E7EB",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1117", marginBottom: 2 }}>
            {asset.nombre || asset.ciudad || "Activo sin nombre"}
          </div>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>
            {asset.ciudad} · {asset.pais || ""} · ID: {asset.id?.slice(0, 8)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            color: "#1E3A5F",
            fontWeight: 700,
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
          }}>
            {stratLabel}
          </span>
          <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>
            {Math.round((asset.confidence_final || 0) * 100)}% fidelidad
          </span>
        </div>
      </div>

      {/* Grid: izquierda | galería | derecha */}
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 150px", gap: 16, padding: "16px 18px", flex: 1 }}>
        {/* Columna izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <MetricModule
            label={config.topLeft.label}
            value={formatValue(getVal(config.topLeft.field), config.topLeft.format)}
            showBar
            barWidth={Math.min(100, (getVal(config.topLeft.field) || 0) * (config.topLeft.format === "percent" ? 100 / (config.topLeft.barMax || 1) : 1))}
          />
          <MetricModule
            label={config.bottomLeft.label}
            value={`${formatValue(getVal(config.bottomLeft.field), config.bottomLeft.format)}`}
            sub={risk.label}
          />
        </div>

        {/* Galería central - Enlarged verticaly */}
        <div style={{ display: "flex", minHeight: 400 }}>
          <GalleryModule photos={asset.photo_urls} />
        </div>

        {/* Columna derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <GScoreRing score={asset.g_score || 0} />
          <MetricModule
            label={config.bottomRight.label}
            value={formatValue(getVal(config.bottomRight.field), config.bottomRight.format)}
          />
        </div>

        {/* Informe de Asset (Ancho total) */}
        <div style={{ 
          gridColumn: "1 / -1", 
          marginTop: 12,
          background: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: "16px 20px",
          width: "100%", 
        }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>Informe de Inversión Geoland</div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, fontWeight: 400 }}>
            <p style={{ marginBottom: 6 }}>
              Activo identificado mediante algoritmos de ISV como oportunidad crítica de **Fix & Flip**. 
              Ubicación en zona de alta demanda con ratio de absorción acelerado.
            </p>
            <p>
              Estructura financiera optimizada: Precio de adquisición {formatValue(asset.precio_usd, "currency")} con CapEx proyectado de {formatValue(asset.capex_estimado, "currency")}. 
              Retorno a la inversión (ROI) del {formatValue(asset.roiTotal, "percent")} en un horizonte de salida de {asset.payback_meses || 8} meses.
            </p>
            {asset.descripcion && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E7EB" }}>{asset.descripcion}</div>}
          </div>
        </div>
      </div>

      <div style={{
        padding: "8px 14px 12px",
        fontSize: 11,
        color: "#6B7280",
        fontWeight: 400,
        lineHeight: 1.6,
        borderTop: "1px solid #E5E7EB",
      }}>
        {asset.descripcion || `Activo en ${asset.ciudad} — estrategia ${stratLabel}.`}
        <span style={{ marginLeft: 8, color: "#1E3A5F", fontWeight: 600 }}>
          Confianza {Math.round((asset.confidence_final || 0) * 100)}%
        </span>
      </div>
    </div>
  );
}
