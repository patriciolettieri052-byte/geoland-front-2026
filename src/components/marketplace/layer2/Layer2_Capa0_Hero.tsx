"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AssetMatchItem } from "@/types/geoland";
import { HERO_METRICS_CONFIG, STRATEGY_COLORS, STRATEGY_LABELS, normalizeStrategyKey } from "./layer2.config";

// ─── Constants ──────────────────────────────────────────────────────────────
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parsePhotos = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === 'string' && Boolean(item));
  if (typeof raw === 'string') {
    // Supabase a veces devuelve el array como string JSON
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && Boolean(item));
      return [raw].filter(url => url.startsWith('http'));
    } catch {
      return raw.startsWith('http') ? [raw] : [];
    }
  }
  return [];
};
function formatValue(value: number | undefined | null, format: string): string {
  if (value === undefined || value === null) return "—";
  switch (format) {
    // value < 1 → decimal (0.185 → 18.5%); value >= 1 pero != 100 → ya en pct; edge-case value===1.0 → 100%
    case "percent":  return `${(value <= 1 ? value * 100 : value).toFixed(1)}%`;
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
function BigMetric({ label, value, color, sub, showBar, barWidth, showChart }: {
  label: string; value: string; color?: string; sub?: string; showBar?: boolean; barWidth?: number; showChart?: boolean;
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
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{ height: "100%", background: color || "rgba(0,0,0,0.65)", borderRadius: 2 }} 
          />
        </div>
      )}
      {showChart && (
        <div style={{ height: 30, marginTop: 4, position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color || "#16A34A"} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color || "#16A34A"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
                d="M 0 28 Q 20 25 40 20 Q 60 22 80 10 L 100 2"
                fill="none"
                stroke={color || "#16A34A"}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.path
                d="M 0 28 Q 20 25 40 20 Q 60 22 80 10 L 100 2 V 30 H 0 Z"
                fill={`url(#grad-${label})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
            />
          </svg>
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
            <motion.circle
              cx="36" cy="36" r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="5"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${circ}` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"
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
  const displayPhotos = photos && photos.length > 0 ? photos : [PLACEHOLDER];
  const [current, setCurrent] = useState(0);
  const total = displayPhotos.length;

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
      <div style={{ 
        flex: 1, 
        background: "#F3F4F6", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        position: "relative", 
        minHeight: 120 
      }}>
        <img 
          src={displayPhotos[current]} 
          alt={`foto ${current + 1} de ${total}`} 
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER;
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </div>

      {total > 1 && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 5, 
          padding: "8px 12px", 
          borderTop: "1px solid #F3F4F6" 
        }}>
          <button 
            onClick={() => setCurrent(Math.max(0, current - 1))} 
            style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "0 4px" }}
          >
            {"<"}
          </button>
          
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {displayPhotos.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrent(i)} 
                style={{
                  width: i === current ? 14 : 6, 
                  height: 6,
                  borderRadius: i === current ? 3 : "50%",
                  background: i === current ? "#000000" : "#E5E7EB",
                  cursor: "pointer", 
                  transition: "all 0.2s",
                }} 
              />
            ))}
          </div>

          <button 
            onClick={() => setCurrent(Math.min(total - 1, current + 1))} 
            style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "0 4px" }}
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Layer2Capa0Hero({ asset }: { asset: AssetMatchItem }) {
  const rawEstrategia = (asset.strategy || asset.estrategia || 'RENTAL_LONG_TERM') as string;
  const estrategia = normalizeStrategyKey(rawEstrategia);
  const config = HERO_METRICS_CONFIG[estrategia] || HERO_METRICS_CONFIG.FIX_FLIP;
  const stratLabel = STRATEGY_LABELS[estrategia] || estrategia;
  const risk = getRiskLabel(asset.risk_score || 50);

  const getVal = (field: string) => (asset as Record<string, unknown>)[field] as number | undefined;

  const tirValue = getVal(config.topLeft.field) ?? 0.185;
  const tirFormatted = formatValue(tirValue, config.topLeft.format);
  const gScore = asset.g_score ?? 82;
  const confidence = Math.round((asset.confidence_final ?? 0.85) * 100);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>

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
            showChart
          />
          <BigMetric
            label={config.bottomLeft.label}
            value={formatValue(getVal(config.bottomLeft.field), config.bottomLeft.format)}
            color={risk.color}
            sub={risk.label}
            showBar
            barWidth={100 - (getVal(config.bottomLeft.field) || 50)}
          />
        </div>

        {/* Galería central */}
        <div style={{ display: "flex" }}>
          <GalleryModule photos={parsePhotos(asset.fotos || asset.fotos_urls || asset.photo_urls)} />
        </div>

        {/* Columna derecha — 2 módulos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BigMetric
            label="G-Score"
            value={formatValue(gScore, "score")}
            color={gScore >= 80 ? "#059669" : gScore >= 60 ? "#D97706" : "#DC2626"}
            showBar
            barWidth={gScore}
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
            {asset.ciudad || asset.pais
              ? ` Ubicado en ${[asset.ciudad, asset.pais].filter(Boolean).join(", ")}.`
              : ""}
          </p>
          {asset.precio_usd ? (
            <p>
              Precio de adquisición {formatValue(asset.precio_usd, "currency")}
              {asset.capex_estimado ? ` · CapEx proyectado ${formatValue(asset.capex_estimado, "currency")}` : ""}
              {asset.roiTotal ? ` · ROI ${formatValue(asset.roiTotal, "percent")}` : ""}
              {asset.payback_meses ? ` · Horizonte ${asset.payback_meses} meses` : ""}.
            </p>
          ) : (
            <p style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>
              Los datos financieros detallados estarán disponibles próximamente.
            </p>
          )}
          {asset.descripcion && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E7EB", color: "#6B7280" }}>
              {asset.descripcion}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
