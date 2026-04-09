"use client";
import { AssetMatchItem } from "@/types/geoland";

const SEVERITY_STYLES = {
  alto:  { bg: "rgba(226,75,74,0.15)",  color: "#F09595", border: "rgba(226,75,74,0.25)",  label: "Alto"  },
  medio: { bg: "rgba(186,117,23,0.15)", color: "#EF9F27", border: "rgba(186,117,23,0.25)", label: "Medio" },
};

// Mock de riesgos por estrategia — se reemplaza con datos reales del pipeline
function getMockRisks(asset: AssetMatchItem): Array<{ label: string; severity: "alto" | "medio" }> {
  const estrategia = (asset.estrategia as string) || "FIX_FLIP";
  const RISK_TEMPLATES: Record<string, Array<{ label: string; severity: "alto" | "medio" }>> = {
    FIX_FLIP: [
      { label: "ARV optimista sin comparables recientes",    severity: "alto"  },
      { label: "Sobrecostos de obra (+20% buffer aplicado)", severity: "medio" },
      { label: "Producto final sin diferenciador claro",     severity: "medio" },
      { label: "Plusvalía municipal no calculada",           severity: "alto"  },
      { label: "Mercado sensible a tipos de interés",        severity: "medio" },
    ],
    RENTA: [
      { label: "Riesgo cambiario local",                     severity: "alto"  },
      { label: "Regulación de alquileres variable",          severity: "alto"  },
      { label: "Inflación reduce retorno real",              severity: "medio" },
      { label: "Vacancia por estacionalidad",                severity: "medio" },
      { label: "OPEX subestimado en estimación",             severity: "medio" },
    ],
    RENTAL_LONG_TERM: [
      { label: "Riesgo cambiario local",                     severity: "alto"  },
      { label: "Regulación de alquileres variable",          severity: "alto"  },
      { label: "Inflación reduce retorno real",              severity: "medio" },
      { label: "Vacancia por estacionalidad",                severity: "medio" },
      { label: "OPEX subestimado en estimación",             severity: "medio" },
    ],
    FARMLAND: [
      { label: "Retenciones exportación (33%)",              severity: "alto"  },
      { label: "Riesgo climático sequía",                    severity: "medio" },
      { label: "Volatilidad precios commodities",            severity: "medio" },
      { label: "Riesgo político regulatorio",                severity: "alto"  },
      { label: "Costo de riego complementario",              severity: "medio" },
    ],
    DISTRESS: [
      { label: "Due diligence legal incompleto",             severity: "alto"  },
      { label: "Timeline judicial impredecible",             severity: "alto"  },
      { label: "Cargas ocultas sobre el activo",             severity: "alto"  },
      { label: "Valuación puede ser optimista",              severity: "medio" },
      { label: "Liquidez de salida incierta",                severity: "medio" },
    ],
    DISTRESSED: [
      { label: "Due diligence legal incompleto",             severity: "alto"  },
      { label: "Timeline judicial impredecible",             severity: "alto"  },
      { label: "Cargas ocultas sobre el activo",             severity: "alto"  },
      { label: "Valuación puede ser optimista",              severity: "medio" },
      { label: "Liquidez de salida incierta",                severity: "medio" },
    ],
    VALUE_ADD: [
      { label: "CapEx de mejoras puede superar estimado",    severity: "alto"  },
      { label: "Inquilino actual puede resistir reforma",    severity: "medio" },
      { label: "Permiso de obra dependiente de municipio",   severity: "medio" },
      { label: "Cap rate objetivo difícil de alcanzar",      severity: "medio" },
      { label: "Mercado puede corregir durante obra",        severity: "medio" },
    ],
    LAND_BANKING: [
      { label: "Horizonte largo sin flujo de caja",          severity: "alto"  },
      { label: "Cambio de zonificación incierto",            severity: "alto"  },
      { label: "Liquidez muy baja en mercado secundario",    severity: "medio" },
      { label: "Costo de oportunidad elevado",               severity: "medio" },
      { label: "Infraestructura pendiente de desarrollo",    severity: "medio" },
    ],
    SHORT_TERM_RENTAL: [
      { label: "Regulación Airbnb en zona",                  severity: "alto"  },
      { label: "Estacionalidad de ocupación",                severity: "medio" },
      { label: "Costo de gestión operativa alto",            severity: "medio" },
      { label: "Competencia creciente en plataformas",       severity: "medio" },
      { label: "OPEX variable difícil de estimar",           severity: "medio" },
    ],
    NNN_COMERCIAL: [
      { label: "Dependencia de un solo inquilino",           severity: "alto"  },
      { label: "Riesgo de vacancia al vencer contrato",      severity: "alto"  },
      { label: "Mercado comercial volátil post-pandemia",    severity: "medio" },
      { label: "Costos de re-arrendamiento elevados",        severity: "medio" },
      { label: "LTV alto puede limitar refinanciación",      severity: "medio" },
    ],
    GREENFIELD: [
      { label: "Permisos y habilitaciones de largo plazo",   severity: "alto"  },
      { label: "Costos de desarrollo pueden escalar",        severity: "alto"  },
      { label: "Mercado puede cambiar antes de entrega",     severity: "medio" },
      { label: "Capital intensivo sin flujo durante obra",   severity: "medio" },
      { label: "Dependencia de contratistas especializados", severity: "medio" },
    ],
    LIVESTOCK: [
      { label: "Riesgo sanitario (enfermedades animales)",   severity: "alto"  },
      { label: "Volatilidad precios carne/leche",            severity: "medio" },
      { label: "Dependencia del arrendatario",               severity: "medio" },
      { label: "Riesgo climático y sequía",                  severity: "medio" },
      { label: "OPEX variable según rodeo",                  severity: "medio" },
    ],
    FORESTRY: [
      { label: "Horizonte de inversión muy largo (15-25a)",  severity: "alto"  },
      { label: "Riesgo de incendio forestal",                severity: "alto"  },
      { label: "Precio de madera volátil",                   severity: "medio" },
      { label: "Regulación ambiental cambiante",             severity: "medio" },
      { label: "Liquidez prácticamente nula hasta cosecha",  severity: "medio" },
    ],
    BUY_AND_HOLD: [
      { label: "Dependencia de apreciación futura",          severity: "medio" },
      { label: "Riesgo de corrección de mercado",            severity: "medio" },
      { label: "OPEX acumulado en horizonte largo",          severity: "medio" },
      { label: "Vacancia puede erosionar retorno",           severity: "medio" },
      { label: "Tipo de cambio (si mercado extranjero)",     severity: "medio" },
    ],
  };
  return RISK_TEMPLATES[estrategia] || RISK_TEMPLATES.FIX_FLIP;
}

interface Capa4Props {
  asset: AssetMatchItem;
  onRequestLayer3?: (assetId: string) => void;
}

export default function Layer2Capa4Riesgos({ asset, onRequestLayer3 }: Capa4Props) {
  const risks = getMockRisks(asset);

  return (
    <>
      {/* Capa 4: Riesgos */}
      <div style={{ padding: "12px 12px 10px", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <div style={{ width: 2, height: 9, borderRadius: 1, background: "rgba(226,75,74,0.5)" }} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Riesgos &amp; red flags
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {risks.map((r, i) => {
            const s = SEVERITY_STYLES[r.severity];
            return (
              <div key={i} style={{
                background: "rgba(226,75,74,0.05)",
                border: `0.5px solid rgba(226,75,74,0.15)`,
                borderRadius: 7,
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{r.label}</span>
                <span style={{
                  fontSize: 8,
                  padding: "2px 7px",
                  borderRadius: 8,
                  background: s.bg,
                  color: s.color,
                  border: `0.5px solid ${s.border}`,
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Layer 3 */}
      <div style={{ padding: "10px 12px 16px", borderTop: "0.5px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <button
          onClick={() => onRequestLayer3 ? onRequestLayer3(asset.id) : console.log("Layer 3 requested for:", asset.id)}
          style={{
            background: "rgba(127,119,221,0.12)",
            border: "0.5px solid rgba(127,119,221,0.35)",
            color: "#AFA9EC",
            fontSize: 11,
            padding: "9px 20px",
            borderRadius: 8,
            cursor: "pointer",
            letterSpacing: "0.02em",
            width: "100%",
          }}
        >
          Generar reporte completo (Layer 3) →
        </button>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", marginTop: 5 }}>
          Investment Memo · Risk Report · Financial Deep Dive · ~20s
        </div>
      </div>
    </>
  );
}
