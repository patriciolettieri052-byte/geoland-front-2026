"use client";

import { motion } from "framer-motion";
import { AssetMatchItem, RedFlag } from "@/types/geoland";

interface RiskItemProps {
  label: string;
  severity: string;
}

function RiskItem({ label, severity }: RiskItemProps) {
  const isHigh = severity?.toLowerCase() === "alto" || severity?.toLowerCase() === "severo";
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      marginBottom: 8,
      background: "#FFFFFF",
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
      <span style={{
        fontSize: 8,
        padding: "4px 10px",
        borderRadius: 20,
        fontWeight: 800,
        textTransform: "uppercase",
        background: isHigh ? "#FEE2E2" : "#FEF3C7",
        color: isHigh ? "#DC2626" : "#D97706",
        border: `1px solid ${isHigh ? "#FECACA" : "#FDE68A"}`,
      }}>
        {severity}
      </span>
    </div>
  );
}

export default function Layer2Capa4Riesgos({ asset }: { asset: AssetMatchItem }) {
  // Datos del veredicto (inyectados por el proxy o backend)
  const layer4 = asset.layer4 || {};
  const veredicto = layer4.verdict || layer4.veredicto || "approved_with_conditions";
  const auditId = layer4.audit_id || `S11-${Math.floor(Math.random() * 9000) + 1000}`;
  const recommendedAction = layer4.recommended_next_action || layer4.proximo_paso || "Verificar documentación legal y técnica antes de proceder con la reserva.";

  // Mapeo de veredicto visual
  const getVerdictStyle = (v: string) => {
    const val = String(v).toLowerCase();
    if (val.includes("approve") || val.includes("aprobado")) {
        if (val.includes("condition") || val.includes("condicion")) {
            return { label: "Veredicto: Aprobado con condiciones", bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" };
        }
        return { label: "Veredicto: Aprobado", bg: "#DCFCE7", text: "#16A34A", border: "#BBF7D0" };
    }
    if (val.includes("reject") || val.includes("rechazado")) {
        return { label: "Veredicto: Rechazado", bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" };
    }
    return { label: "Veredicto: Aprobado con condiciones", bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" };
  };

  const vStyle = getVerdictStyle(veredicto);

  // Red Flags
  const redFlags: RedFlag[] = asset.layer4?.red_flags || asset.red_flags || [];

  return (
    <div style={{ padding: "24px", borderTop: "1px solid #E5E7EB" }}>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 12, background: "#DC2626", borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#9CA3AF", letterSpacing: "0.1em" }}>
            Verificador · Auditoría de Riesgos
          </span>
        </div>
      </div>

      {/* Banner de Veredicto */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderRadius: 12,
          marginBottom: 16,
          background: vStyle.bg,
          color: vStyle.text,
          border: `1px solid ${vStyle.border}`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", boxShadow: "0 0 8px currentColor" }} />
          {vStyle.label}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700 }}>AUDIT ID: {auditId}</div>
      </motion.div>

      {/* Lista de Riesgos */}
      <div style={{ marginBottom: 16 }}>
        {redFlags.length > 0 ? (
          redFlags.map((flag, idx) => (
            <RiskItem 
              key={idx} 
              label={flag.description || flag.name || "Riesgo detectado"} 
              severity={flag.severity || "Medio"} 
            />
          ))
        ) : (
          <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "20px", border: "1px dashed #E5E7EB", borderRadius: 12 }}>
            No se han detectado red flags críticos en el análisis automático.
          </div>
        )}
      </div>

      {/* Acción Recomendada */}
      <div style={{
        background: "#F9FAFB",
        border: "1px solid #E5E7EB",
        padding: "16px",
        borderRadius: 12,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}>
        <div style={{ 
          fontSize: 9, 
          fontWeight: 800, 
          color: "#FFFFFF", 
          background: "#000000", 
          padding: "2px 6px", 
          borderRadius: 4, 
          textTransform: "uppercase", 
          marginTop: 2,
          flexShrink: 0
        }}>
          INFO
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase" }}>Acción recomendada</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            {recommendedAction}
          </span>
        </div>
      </div>

    </div>
  );
}
