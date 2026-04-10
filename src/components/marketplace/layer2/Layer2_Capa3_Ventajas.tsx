"use client";
import { AssetMatchItem } from "@/types/geoland";

const BAR_COLORS = {
  green:  "rgba(29,158,117,0.6)",
  purple: "rgba(127,119,221,0.6)",
  amber:  "rgba(186,117,23,0.6)",
};

function AdvCard({ title, value, description, barPercent, color }: {
  title: string; value: string; description: string; barPercent: number; color: "green" | "purple" | "amber";
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.24)",
      border: "0.5px solid rgba(255,255,255,0.07)",
      borderRadius: 8,
      padding: "9px 11px",
    }}>
      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3, fontWeight: 700 }}>
        {title}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color === "green" ? "#1D9E75" : color === "purple" ? "#5A4282" : "#B1720C" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.45)", marginTop: 2, fontWeight: 500 }}>{description}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barPercent}%`, background: BAR_COLORS[color], borderRadius: 2 }} />
      </div>
    </div>
  );
}

// Mock — se reemplaza con datos reales del pipeline
function getMockAdvantages(asset: AssetMatchItem) {
  const irr = (asset.irr_equivalente || 0.1) * 100;
  const conf = (asset.confidence_final || 0.7) * 100;
  return [
    { title: "Retorno financiero", value: `${irr.toFixed(1)}%`, description: "IRR equivalente",              barPercent: Math.min(irr * 2.5, 100), color: "green"  as const },
    { title: "Calidad del activo", value: `${Math.round(conf)}%`, description: "Confidence del pipeline",    barPercent: conf,                      color: "purple" as const },
    { title: "Match con perfil",   value: `${asset.g_score || 75}`, description: "G-Score personalizado",    barPercent: asset.g_score || 75,       color: "purple" as const },
    { title: "Riesgo relativo",    value: (asset.risk_score || 50) < 40 ? "Bajo" : (asset.risk_score || 50) < 65 ? "Medio" : "Alto",
      description: "Risk score pipeline", barPercent: 100 - (asset.risk_score || 50),                       color: "amber"  as const },
  ];
}

export default function Layer2Capa3Ventajas({ asset }: { asset: AssetMatchItem }) {
  const advantages = getMockAdvantages(asset);
  return (
    <div style={{ padding: "12px 12px 10px", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <div style={{ width: 2, height: 9, borderRadius: 1, background: "rgba(186,117,23,0.5)" }} />
        <span style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          Ventajas estructurales
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {advantages.map((a, i) => <AdvCard key={i} {...a} />)}
      </div>
    </div>
  );
}
