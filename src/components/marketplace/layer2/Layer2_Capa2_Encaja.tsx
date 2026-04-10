"use client";
import { AssetMatchItem } from "@/types/geoland";

const STATUS_STYLES = {
  ok:   { bg: "rgba(29,158,117,0.2)",  color: "#5DCAA5", symbol: "✓" },
  warn: { bg: "rgba(186,117,23,0.2)",  color: "#EF9F27", symbol: "!" },
  fail: { bg: "rgba(226,75,74,0.2)",   color: "#F09595", symbol: "✗" },
};

function CheckItem({ label, status }: { label: string; status: "ok" | "warn" | "fail" }) {
  const s = STATUS_STYLES[status];
  return (
    <div style={{
      background: "rgba(255,255,255,0.30)",
      border: "0.5px solid rgba(0,0,0,0.1)",
      borderRadius: 7,
      padding: "6px 9px",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 10,
      color: "#2D2E35",
      fontWeight: 600,
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: s.bg, color: s.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, flexShrink: 0, fontWeight: 700,
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
    <div style={{ padding: "12px 12px 10px", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <div style={{ width: 2, height: 9, borderRadius: 1, background: "rgba(29,158,117,0.5)" }} />
        <span style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          Cuándo encaja
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {checks.map((c, i) => <CheckItem key={i} {...c} />)}
      </div>
    </div>
  );
}
