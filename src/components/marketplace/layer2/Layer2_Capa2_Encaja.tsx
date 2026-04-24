"use client";
import { AssetMatchItem } from "@/types/geoland";

const STATUS_COLORS = {
  ok:   "#16A34A",
  warn: "#D97706",
  fail: "#DC2626",
};

function CheckItem({ label, status }: { label: string; status: "ok" | "warn" | "fail" }) {
  const color = STATUS_COLORS[status];
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    }}>
      <div style={{
        width: 4, height: 4, borderRadius: "50%",
        background: color, flexShrink: 0,
      }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{label}</span>
    </div>
  );
}

// Mock de evaluación
function getMockChecks(asset: AssetMatchItem): Array<{ label: string; status: "ok" | "warn" | "fail" }> {
  const score = asset.g_score || 50;
  const risk = asset.risk_score || 50;
  return [
    { label: "Perfil inversor compatible",   status: score > 70 ? "ok" : score > 50 ? "warn" : "fail" },
    { label: "Mercado en preferencias ISV",  status: "ok" },
    { label: "Tipo activo encaja",           status: "ok" },
    { label: "IRR sobre umbral mínimo",      status: (asset.roiTotal || 0) > 0.08 ? "ok" : "warn" },
    { label: "Horizonte alineado",           status: "ok" },
    { label: "Liquidez compatible",          status: risk < 60 ? "ok" : "warn" },
  ];
}

export default function Layer2Capa2Encaja({ asset }: { asset: AssetMatchItem }) {
  const checks = getMockChecks(asset);
  return (
    <div style={{ padding: "24px", borderTop: "1px solid #E5E7EB", background: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 3, height: 12, borderRadius: 2, background: "#000000" }} />
        <span style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>
          Análisis de Compatibilidad · Cuándo encaja
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {checks.map((c, i) => <CheckItem key={i} {...c} />)}
      </div>
    </div>
  );
}
