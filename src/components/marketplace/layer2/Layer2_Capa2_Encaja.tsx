"use client";
import { AssetMatchItem } from "@/types/geoland";

const STATUS_STYLES = {
  ok:   { bg: "#ECFDF5",  color: "#059669", symbol: "✓" },
  warn: { bg: "#FFFBEB",  color: "#D97706", symbol: "!" },
  fail: { bg: "#FEF2F2",  color: "#DC2626", symbol: "✗" },
};

function CheckItem({ label, status }: { label: string; status: "ok" | "warn" | "fail" }) {
  const s = STATUS_STYLES[status];
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 7,
      padding: "8px 10px",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 10,
      color: "#374151",
      fontWeight: 500,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: s.bg, color: s.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, flexShrink: 0, fontWeight: 800,
      }}>
        {s.symbol}
      </div>
      {label}
    </div>
  );
}

// Mock de evaluación — se reemplaza cuando el backend inyecte los datos reales
function getMockChecks(asset: AssetMatchItem): Array<{ label: string; status: "ok" | "warn" | "fail" }> {
  const score = asset.g_score || 50;
  const risk = asset.risk_score || 50;
  return [
    { label: "Perfil inversor compatible",   status: score > 70 ? "ok" : score > 50 ? "warn" : "fail" },
    { label: "Mercado en preferencias ISV",  status: "ok" },
    { label: "Tipo activo encaja",           status: "ok" },
    { label: "IRR sobre umbral mínimo",      status: (asset.irr_equivalente || 0) > 0.08 ? "ok" : "warn" },
    { label: "Horizonte alineado",           status: "ok" },
    { label: "Liquidez compatible",          status: risk < 60 ? "ok" : "warn" },
  ];
}

export default function Layer2Capa2Encaja({ asset }: { asset: AssetMatchItem }) {
  const checks = getMockChecks(asset);
  return (
    <div style={{ padding: "12px 12px 10px", borderTop: "1px solid #E5E7EB", background: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <div style={{ width: 2, height: 9, borderRadius: 1, background: "#10B981" }} />
        <span style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          Cuándo encaja
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {checks.map((c, i) => <CheckItem key={i} {...c} />)}
      </div>
    </div>
  );
}
