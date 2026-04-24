"use client";
import { motion } from "framer-motion";
import { AssetMatchItem } from "@/types/geoland";

const BAR_COLORS = {
  green:  "#16A34A",
  purple: "#000000",
  amber:  "#D97706",
};

function AdvCard({ title, value, description, barPercent, color }: {
  title: string; value: string; description: string; barPercent: number; color: "green" | "purple" | "amber";
}) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "14px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }}>
      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800 }}>
        {title}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color === "green" ? "#16A34A" : color === "purple" ? "#000000" : "#D97706" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>{description}</div>
      <div style={{ height: 3, background: "#F3F4F6", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
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

// Mock de ventajas
function getMockAdvantages(asset: AssetMatchItem) {
  const irr = (asset.roiTotal || 0.1) * 100;
  const conf = (asset.confidence_final || 0.85) * 100;
  return [
    { title: "Retorno financiero", value: `${irr.toFixed(1)}%`, description: "IRR equivalente", barPercent: Math.min((irr / 40) * 100, 100), color: "green" as const },
    { title: "Calidad del dato", value: `${Math.round(conf)}%`, description: "Confidence score", barPercent: conf, color: "purple" as const },
    { title: "Match con perfil", value: `${asset.g_score || 82}`, description: "G-Score Geoland", barPercent: asset.g_score || 82, color: "purple" as const },
    { title: "Riesgo relativo", value: (asset.risk_score || 50) < 40 ? "Bajo" : (asset.risk_score || 50) < 65 ? "Medio" : "Alto", description: "Risk level auditor", barPercent: 100 - (asset.risk_score || 50), color: "amber" as const },
  ];
}

export default function Layer2Capa3Ventajas({ asset }: { asset: AssetMatchItem }) {
  const advantages = getMockAdvantages(asset);
  return (
    <div style={{ padding: "24px", borderTop: "1px solid #E5E7EB", background: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 3, height: 12, borderRadius: 2, background: "#000000" }} />
        <span style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>
          Perfil de Riesgo-Retorno
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {advantages.map((a, i) => <AdvCard key={i} {...a} />)}
      </div>
    </div>
  );
}
