"use client";

import { AssetMatchItem } from "@/types/geoland";
import Layer2Capa0Hero from "./Layer2_Capa0_Hero";
import Layer2Capa1Financiero from "./Layer2_Capa1_Financiero";
import Layer2Capa2Encaja from "./Layer2_Capa2_Encaja";
import Layer2Capa3Ventajas from "./Layer2_Capa3_Ventajas";
import Layer2Capa4Riesgos from "./Layer2_Capa4_Riesgos";

interface Layer2ContainerProps {
  asset: AssetMatchItem;
  onClose: () => void;
}

export default function Layer2Container({ asset, onClose }: Layer2ContainerProps) {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "transparent" }}
    >
      {/* Sticky back button */}
      <div
        className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2"
        style={{
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← Volver
        </button>
        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>|</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {asset.nombre || asset.location}
        </span>
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
    </div>
  );
}
