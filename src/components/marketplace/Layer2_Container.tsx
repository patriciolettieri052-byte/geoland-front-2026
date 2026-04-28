import { useState } from "react";
import { AssetMatchItem } from "@/types/geoland";
import Layer2Capa0Hero from "./Layer2_Capa0_Hero";
import Layer2Capa1Financiero from "./Layer2_Capa1_Financiero";
import Layer2Capa2Encaja from "./Layer2_Capa2_Encaja";
import Layer2Capa3Ventajas from "./Layer2_Capa3_Ventajas";
import Layer2Capa4Riesgos from "./Layer2_Capa4_Riesgos";
import Layer2LeadModal from "./Layer2_LeadModal";

interface Layer2ContainerProps {
  asset: AssetMatchItem;
  onClose: () => void;
}

export default function Layer2Container({ asset, onClose }: Layer2ContainerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full relative overflow-hidden" style={{ background: "#F9FAFB" }}>
      {/* Contenedor scrollable para el contenido */}
      <div className="h-full overflow-y-auto">
        {/* Sticky header */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden mr-4">
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#000000",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              VOLVER
            </button>
            <div style={{ color: "#E5E7EB", fontSize: "12px" }}>|</div>
            <span 
              className="truncate"
              style={{ 
                fontSize: "11px", 
                fontWeight: 700, 
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.02em"
              }}
            >
              {/* V5-FIX: mostrar nombre legible, no el asset_id técnico */}
              {asset.nombre || asset.descripcion?.substring(0, 50) || asset.barrio || asset.mercado || "ASSET DETAILS"}
              {(asset.barrio || asset.ciudad) && ` · ${asset.barrio || asset.ciudad}`}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "#000000",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s"
            }}
          >
            Me interesa este activo
          </button>
        </div>

        {/* Capas apiladas verticalmente */}
        <Layer2Capa0Hero asset={asset} />
        <Layer2Capa1Financiero asset={asset} />
        <Layer2Capa2Encaja asset={asset} />
        <Layer2Capa3Ventajas asset={asset} />
        <Layer2Capa4Riesgos
          asset={asset}
          onRequestLayer3={(id) => {
            // F7-FIX: Layer3 diferido — mostrar mensaje al usuario
            alert('El análisis profundo (Layer 3) estará disponible próximamente. Guardá este activo en favoritos para acceder cuando esté listo.');
          }}
        />
      </div>

      {/* Modal de Lead - ahora posicionado absoluto respecto al root de Layer2Container */}
      <Layer2LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onClose(); // Cierra toda la Layer 2 automáticamente
        }}
        assetName={asset.nombre || "Este activo"}
      />
    </div>
  );
}
