# Guía de Despliegue - GEOLAND MVP 🚀

Esta aplicación está optimizada para desplegarse en **Vercel** en menos de 5 minutos. Sigue estos pasos para llevar tu MVP a producción para el Pitch.

## Opción 1: Despliegue Rápido con Vercel (Recomendado)

### 1. Preparar el Repositorio
Asegúrate de que tu código esté en un repositorio de GitHub, GitLab o Bitbucket.

### 2. Importar en Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en **"Add New"** > **"Project"**.
3. Selecciona tu repositorio de GEOLAND.

### 3. Configurar Variables de Entorno (CRÍTICO) 🔑
Antes de darle a "Deploy", busca la sección **Environment Variables** y añade:
*   **Key**: `GEMINI_API_KEY`
*   **Value**: (Tu clave de API de Google AI Studio)

*Nota: Vercel detectará automáticamente que es un proyecto de Next.js y configurará los comandos de build por ti.*

### 4. ¡Listo!
Haz clic en **Deploy**. En un minuto tendrás una URL pública tipo `geoland-project.vercel.app`.

---

## Opción 2: Despliegue en un VPS (Ubuntu/Debian)

Si decides usar un VPS, sigue este flujo:

### 1. Preparación del Servidor
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (Versión 18 o superior recomendada)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clonar y Configurar
```bash
git clone <tu-repo-url>
cd geoland-front-2026
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en el servidor:
```bash
nano .env.local
# Pega dentro: GEMINI_API_KEY=tu_clave_aca
```

### 4. Build e Inicio con PM2 (Gestor de Procesos)
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Construir la app para producción
npm run build

# Iniciar la app
pm2 start npm --name "geoland-pitch" -- start
```

---

## Notas Importantes para Producción

1. **Latencia**: Al usar funciones Serverless en Vercel, la primera llamada al chat después de mucho tiempo de inactividad puede tardar un par de segundos más (Cold Start). Para el Pitch, te recomiendo abrir la URL 1 minuto antes para "despertar" el servicio.
2. **Costo**: El plan gratuito de Vercel es suficiente para una demo de este tipo.
3. **Imágenes**: Asegúrate de que `monolith2.jpeg` esté dentro de la carpeta `/public` para que se despliegue correctamente.

¡Mucho éxito en el Pitch! 🥂
