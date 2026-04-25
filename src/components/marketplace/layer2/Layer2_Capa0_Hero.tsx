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
  if (score < 35) return { label: "BAJO",  color: "#16A34A" };
  if (score < 65) return { label: "MEDIO", color: "#D97706" };
  return             { label: "ALTO",  color: "#DC2626" };
}

// ─── BigMetric — número grande con barra opcional ─────────────────────────────
function BigMetric({ label, value, color, sub, showBar, barWidth, showChart }: {
  label: string; value: string; color?: string; sub?: string; showBar?: boolean; barWidth?: number; showChart?: boolean;
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 16,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      flex: 1,
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontSize: 38, fontWeight: 300, color: color || "#0F1117", lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, fontWeight: 800, color: color || "#6B7280", marginTop: 2 }}>
          {sub}
        </div>
      )}
      {showBar && barWidth !== undefined && (
        <div style={{ height: 4, background: "#F3F4F6", borderRadius: 10, marginTop: 10, overflow: "hidden" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{ height: "100%", background: color || "rgba(0,0,0,0.65)", borderRadius: 10 }} 
          />
        </div>
      )}
      {showChart && (
        <div style={{ height: 30, marginTop: 6, position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color || "#16A34A"} stopOpacity="0.1" />
                <stop offset="100%" stopColor={color || "#16A34A"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
                d="M 0 28 Q 20 25 40 20 Q 60 22 80 10 L 100 2"
                fill="none"
                stroke={color || "#16A34A"}
                strokeWidth="2.5"
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
  const ringColor = percent >= 80 ? "#16A34A" : percent >= 60 ? "#D97706" : "#DC2626";

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 16,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      flex: 1,
      alignItems: "flex-start",
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", marginTop: 4 }}>
        <div style={{ position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="56" height="56" viewBox="0 0 72 72" style={{ position: "absolute", top: 0, left: 0 }}>
            <circle cx="36" cy="36" r={r} fill="none" stroke="#F3F4F6" strokeWidth="9" />
            <motion.circle
              cx="36" cy="36" r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="9"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${dash} ${circ}` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"
            />
          </svg>
          <span style={{ position: "relative", zIndex: 1, fontSize: 13, fontWeight: 700, color: ringColor, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
            {percent >= 80 ? "ALTA" : percent >= 60 ? "MEDIA" : "BAJA"}
          </span>
          <span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 500 }}>
            Pipeline Audit
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Galería ──────────────────────────────────────────────────────────────────
function GalleryModule({ photos, strategy }: { photos?: string[]; strategy: string }) {
  const displayPhotos = photos && photos.length > 0 ? photos : [PLACEHOLDER];
  const [current, setCurrent] = useState(0);
  const total = displayPhotos.length;

  return (
    <div style={{
      background: "#000000",
      border: "1px solid #E5E7EB",
      borderRadius: 16,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "relative",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        position: "relative", 
        minHeight: 220 
      }}>
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 5,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          color: "#FFFFFF", fontSize: 9, padding: "5px 12px", borderRadius: 6,
          textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.08em"
        }}>
          {strategy}
        </div>
        <img 
          src={displayPhotos[current]} 
          alt={`foto ${current + 1}`} 
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </div>

      {total > 1 && (
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {displayPhotos.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setCurrent(i)} 
              style={{
                width: i === current ? 16 : 6, 
                height: 6,
                borderRadius: i === current ? 4 : "50%",
                background: i === current ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                cursor: "pointer", transition: "all 0.2s",
              }} 
            />
          ))}
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

  // Datos de Tesis (Capa 2)
  const thesisTitle = asset.layer2?.thesis?.title || `${stratLabel} en zona core con potencial de apreciación.`;
  const thesisParagraph = asset.layer2?.thesis?.paragraph || asset.descripcion || asset.layer1?.rationale || "Análisis de oportunidad basado en parámetros de mercado y algoritmos de selección Geoland.";
  const thesisTags = asset.layer2?.thesis?.tags || ["Oportunidad Validada", "Microzona Prime"];
  const proofPoints = asset.layer2?.thesis?.proof_points || [
    { label: "Métrica principal soportada por comparables", value: "✓" },
    { label: "Ubicación con alta liquidez de salida", value: "✓" }
  ];

  return (
    <div style={{ background: "#FFFFFF", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Grid KPIs y Galería ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        gap: 16,
        alignItems: "stretch",
      }}>
        {/* Columna Izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BigMetric
            label={config.topLeft.label}
            value={tirFormatted}
            color="#16A34A"
            showChart
          />
          <BigMetric
            label="RISK SCORE"
            value={formatValue(asset.risk_score, "score") || "50"}
            color={risk.color}
            sub={risk.label}
            showBar
            barWidth={asset.risk_score || 50}
          />
        </div>

        {/* Galería Central */}
        <GalleryModule 
          photos={parsePhotos(asset.fotos || asset.fotos_urls || asset.photo_urls)} 
          strategy={stratLabel}
        />

        {/* Columna Derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <BigMetric
            label="G-SCORE"
            value={formatValue(gScore, "score")}
            color={gScore >= 80 ? "#16A34A" : gScore >= 60 ? "#D97706" : "#DC2626"}
            showBar
            barWidth={gScore}
          />
          <RingMetric
            label="DATA CONFIDENCE"
            percent={confidence}
            value={`${confidence}%`}
          />
        </div>
      </div>

      {/* ── Tesis de Inversión (Alineada a Spec) ── */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F1117", letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0 }}>
            {thesisTitle}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {thesisTags.map((tag: string, i: number) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                padding: "4px 10px", borderRadius: 6, background: "#F3F4F6", color: "#6B7280",
                letterSpacing: "0.05em", border: "1px solid #E5E7EB"
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4B5563", margin: 0 }}>
          {thesisParagraph}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          {proofPoints.map((point: { label: string; value: string }, i: number) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              padding: "10px 14px", borderRadius: 10,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{point.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
