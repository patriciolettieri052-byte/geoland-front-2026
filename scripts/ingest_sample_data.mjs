import fs from 'fs';
import path from 'path';

// Configuración manual basada en .env.local y hallazgos previos
const API_URL = 'https://geoland-backend-final.onrender.com';
const API_KEY = 'geoland-dev-key-abc123';

// Ruta al archivo de datos en el backend (usando ruta absoluta para seguridad)
const DATA_PATH = 'C:/Users/59892/Desktop/BACKEND GEOLAND/sample_raw_listings.json';

async function ingest() {
    console.log('🚀 Iniciando ingesta de datos en Render...');
    
    try {
        if (!fs.existsSync(DATA_PATH)) {
            throw new Error(`Archivo no encontrado en: ${DATA_PATH}`);
        }

        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        const listings = JSON.parse(rawData);

        console.log(`📦 Preparando ${listings.length} activos para ingesta...`);

        const response = await fetch(`${API_URL}/api/v1/ingest?sync=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(listings)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en el backend (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Ingesta enviada con éxito!');
        console.log('Resumen del Backend:', JSON.stringify(result, null, 2));
        
        if (result.status === 'completed_sync') {
            console.log(`✨ Sincronización completa: ${result.count} activos procesados.`);
        } else {
            console.warn(`⚠ El backend respondió con status: ${result.status}`);
        }

    } catch (error) {
        console.error('❌ Error fatal durante la ingesta:');
        console.error(error.message);
        process.exit(1);
    }
}

ingest();
