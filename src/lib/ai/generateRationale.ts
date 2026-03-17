// src/lib/ai/generateRationale.ts
// Genera el texto de justificación para cada activo usando el LLM Oracle.

import { Asset } from "@/lib/mockEngine";
import { FiltrosBlandosIsv } from "@/store/useGeolandStore";

export async function generateRationale(
    asset: Asset,
    isv: FiltrosBlandosIsv
): Promise<string> {
    const prompt = `
    En 2 oraciones máximo, justifica por qué este activo es relevante para el inversor.
    Activo: ${asset.strategy} en ${asset.location}.
    IRR esperada: ${(asset.layer1.expectedIrr * 100).toFixed(1)}%.
    Perfil del inversor: Estrategia ${isv.estrategiaObjetivo},
    Riesgo ${isv.riesgoTolerancia}, Horizonte ${isv.horizonteAnos}.
    Responde strictamente asumiendo el rol del Oráculo de GEOLAND y llena tu respuesta en 'dialogo_ui'.`;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt, history: [] }),
        });

        const data = await res.json();
        return data.dialogo_ui ?? 'Asset aligned perfectly with active requirements and location scope.';
    } catch (err) {
        console.error('Rationale generation failed:', err);
        return 'Asset aligned perfectly with active requirements and location scope.';
    }
}
