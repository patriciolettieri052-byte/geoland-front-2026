"use client";

import { useState } from "react";
import { AssetMatchItem } from "@/types/geoland";
import { HERO_METRICS_CONFIG, STRATEGY_COLORS, STRATEGY_LABELS } from "./layer2.config";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  if (score < 35) return { label: "Bajo",  color: "#16A34A" };
  if (score < 65) return { label: "Medio", color: "#D97706" };
  return             { label: "Alto",  color: "#DC2626" };
}

// ─── BigMetric — número grande con barra opcional ─────────────────────────────
function BigMetric({ label, value, color, sub, showBar, barWidth }: {
  label: string; value: string; color?: string; sub?: string; showBar?: boolean; barWidth?: number;
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      flex: 1,
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 300, color: color || "#0F1117", lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, fontWeight: 600, color: color || "#6B7280", marginTop: 2 }}>
          {sub}
        </div>
      )}
      {showBar && barWidth !== undefined && (
        <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: color || "rgba(0,0,0,0.65)", borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
}

// ─── RingMetric — anillo de confidence ───────────────────────────────────────
function RingMetric({ label, value, percent }: {
  label: string; value: string; percent: number;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const ringColor = percent >= 80 ? "#059669" : percent >= 60 ? "#D97706" : "#DC2626";

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      flex: 1,
      alignItems: "flex-start",
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
        <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ position: "absolute", top: 0, left: 0 }}>
            <circle cx="36" cy="36" r={r} fill="none" stroke="#F3F4F6" strokeWidth="5" />
            <circle
              cx="36" cy="36" r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <span style={{ position: "relative", zIndex: 1, fontSize: 14, fontWeight: 500, color: ringColor, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>
            {percent >= 80 ? "Alta confianza" : percent >= 60 ? "Confianza media" : "Baja confianza"}
          </span>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>
            Calidad de datos del pipeline
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Galería ──────────────────────────────────────────────────────────────────
function GalleryModule({ photos }: { photos?: string[] }) {
  const [current, setCurrent] = useState(0);
  const total = photos?.length || 4;
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ flex: 1, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 90 }}>
        {photos?.[current]
          ? <img src={photos[current]} alt={`foto ${current + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 10, color: "#9CA3AF" }}>foto {current + 1} / {total}</span>
        }
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8, borderTop: "1px solid #F3F4F6" }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "0 4px" }}>{"<"}</button>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 14 : 6, height: 6,
            borderRadius: i === current ? 3 : "50%",
            background: i === current ? "#000000" : "#E5E7EB",
            cursor: "pointer", transition: "all 0.2s",
          }} />
        ))}
        <button onClick={() => setCurrent(Math.min(total - 1, current + 1))} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "0 4px" }}>{">"}</button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Layer2Capa0Hero({ asset }: { asset: AssetMatchItem }) {
  const estrategia = (asset.estrategia as string) || "FIX_FLIP";
  const config = HERO_METRICS_CONFIG[estrategia] || HERO_METRICS_CONFIG.FIX_FLIP;
  const stratLabel = STRATEGY_LABELS[estrategia] || estrategia;
  const risk = getRiskLabel(asset.risk_score || 50);

  const getVal = (field: string) => (asset as Record<string, unknown>)[field] as number | undefined;

  const tirValue = getVal(config.topLeft.field);
  const tirFormatted = formatValue(tirValue, config.topLeft.format);
  const gScore = asset.g_score || 0;
  const confidence = Math.round((asset.confidence_final || 0) * 100);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "12px 20px 10px",
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
            {asset.ciudad}{asset.pais ? ` · ${asset.pais}` : ""} · ID: {asset.id?.slice(0, 8)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", color: "#000000", fontWeight: 700, fontSize: 10, padding: "3px 10px", borderRadius: 20 }}>
            {stratLabel}
          </span>
          <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>
            {confidence}% fidelidad
          </span>
        </div>
      </div>

      {/* ── Grid principal: col-izq | galería | col-der ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        gap: 16,
        padding: "20px 20px",
        flex: 1,
        alignItems: "stretch",
      }}>

        {/* Columna izquierda — 2 módulos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BigMetric
            label={config.topLeft.label}
            value={tirFormatted}
            color="#16A34A"
            showBar
            barWidth={Math.min(100, (tirValue || 0) * (config.topLeft.format === "percent" ? 400 : 1))}
          />
          <BigMetric
            label={config.bottomLeft.label}
            value={formatValue(getVal(config.bottomLeft.field), config.bottomLeft.format)}
            color={risk.color}
            sub={risk.label}
          />
        </div>

        {/* Galería central */}
        <div style={{ display: "flex" }}>
          <GalleryModule photos={asset.photo_urls} />
        </div>

        {/* Columna derecha — 2 módulos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BigMetric
            label="G-Score"
            value={formatValue(gScore, "score")}
            color={gScore >= 80 ? "#059669" : gScore >= 60 ? "#D97706" : "#DC2626"}
          />
          <RingMetric
            label="Confidence"
            percent={confidence}
            value={`${confidence}%`}
          />
        </div>

      </div>

      {/* ── Informe de Inversión — ancho total ── */}
      <div style={{
        margin: "0 20px 20px",
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "16px 20px",
      }}>
        <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
          Informe de Inversión Geoland
        </div>
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, fontWeight: 400 }}>
          <p style={{ marginBottom: 6 }}>
            Activo identificado mediante algoritmos de ISV como oportunidad de {stratLabel}.
            Ubicación en zona de alta demanda con ratio de absorción acelerado.
          </p>
          <p>
            Estructura financiera optimizada: Precio de adquisición {formatValue(asset.precio_usd, "currency")} con CapEx proyectado de {formatValue(asset.capex_estimado, "currency")}.
            Retorno a la inversión (ROI) del {formatValue(asset.roiTotal, "percent")} en un horizonte de salida de {asset.payback_meses || 8} meses.
          </p>
          {asset.descripcion && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E7EB", color: "#6B7280" }}>
              {asset.descripcion}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "8px 20px 14px", fontSize: 11, color: "#9CA3AF", fontWeight: 400, borderTop: "1px solid #E5E7EB" }}>
        {asset.descripcion || `Activo en ${asset.ciudad} — estrategia ${stratLabel}.`}
        <span style={{ marginLeft: 8, color: "#000000", fontWeight: 600 }}>
          Confianza {confidence}%
        </span>
      </div>

    </div>
  );
}
