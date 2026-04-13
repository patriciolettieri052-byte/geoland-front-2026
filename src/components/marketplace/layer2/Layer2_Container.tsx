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
    <div
      className="h-full overflow-y-auto"
      style={{ background: "#F9FAFB" }}
    >
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-3 py-2"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#000000",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            ← Volver
          </button>
          <span style={{ color: "#E5E7EB", fontSize: 11, flexShrink: 0 }}>|</span>
          <span style={{ fontSize: 11, color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {asset.nombre || asset.location}
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
        onRequestLayer3={(id) => console.log("Layer 3 pendiente para:", id)}
      />

      {/* Modal de Lead */}
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
