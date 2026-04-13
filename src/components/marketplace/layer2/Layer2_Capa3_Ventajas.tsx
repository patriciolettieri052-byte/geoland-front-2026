"use client";
import { motion } from "framer-motion";
import { AssetMatchItem } from "@/types/geoland";

const BAR_COLORS = {
  green:  "rgba(22,163,74,0.6)",
  purple: "rgba(0,0,0,0.6)",
  amber:  "rgba(217,119,6,0.6)",
};

function AdvCard({ title, value, description, barPercent, color }: {
  title: string; value: string; description: string; barPercent: number; color: "green" | "purple" | "amber";
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 8,
      padding: "10px 12px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color === "green" ? "#16A34A" : color === "purple" ? "#000000" : "#D97706" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2, fontWeight: 500 }}>{description}</div>
      <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${barPercent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{ height: "100%", background: BAR_COLORS[color], borderRadius: 2 }} 
        />
      </div>
    </div>
  );
}

// Mock — se reemplaza con datos reales del pipeline
function getMockAdvantages(asset: AssetMatchItem) {
  const irr = (asset.irr_equivalente || 0.1) * 100;
  const conf = (asset.confidence_final || 0.7) * 100;
  return [
    // barMax de referencia: 40% IRR => 100% barra (escala real, no multiplicador arbitrario)
    { title: "Retorno financiero", value: `${irr.toFixed(1)}%`, description: "IRR equivalente",              barPercent: Math.min((irr / 40) * 100, 100), color: "green"  as const },
    { title: "Calidad del activo", value: `${Math.round(conf)}%`, description: "Confidence del pipeline",    barPercent: conf,                      color: "purple" as const },
    { title: "Match con perfil",   value: `${asset.g_score || 75}`, description: "G-Score personalizado",    barPercent: asset.g_score || 75,       color: "purple" as const },
    { title: "Riesgo relativo",    value: (asset.risk_score || 50) < 40 ? "Bajo" : (asset.risk_score || 50) < 65 ? "Medio" : "Alto",
      description: "Risk score pipeline", barPercent: 100 - (asset.risk_score || 50),                       color: "amber"  as const },
  ];
}

export default function Layer2Capa3Ventajas({ asset }: { asset: AssetMatchItem }) {
  const advantages = getMockAdvantages(asset);
  return (
    <div style={{ padding: "12px 12px 10px", borderTop: "1px solid #E5E7EB", background: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <div style={{ width: 2, height: 9, borderRadius: 1, background: "#D97706" }} />
        <span style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          Perfil de riesgo-retorno
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {advantages.map((a, i) => <AdvCard key={i} {...a} />)}
      </div>
    </div>
  );
}
