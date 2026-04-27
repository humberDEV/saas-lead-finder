# SaaS Lead Finder MVP

Una herramienta simple para encontrar negocios (ej. barberías, clínicas) en Google Maps que probablemente necesiten una página web u optimización.

## Requisitos
- Node.js (v18 o superior)
- NPM

## Instrucciones para arrancar

1. **Instalar dependencias:**
   Abre una terminal en esta carpeta y ejecuta:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configurar variables de entorno:**
   - Copia el archivo \`.env.local.example\` y renómbralo a \`.env.local\`.
   - Edita \`.env.local\` y añade tu API Key de Google Maps (Places API debe estar habilitada).
   \`\`\`env
   GOOGLE_API_KEY=tu_api_key_real_aqui
   \`\`\`

3. **Iniciar servidor de desarrollo:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Abrir en el navegador:**
   Ve a http://localhost:3000

## Arquitectura

- \`app/page.tsx\`: Home Page que contiene el buscador y el listado de resultados.
- \`app/api/search/route.ts\`: Endpoint interno donde ocurre la llamada a la Places API de Google para proteger la API Key.
- \`lib/score.ts\`: Función de oportunidad de negocio (heuristicas simples para identificar leads).
- \`lib/message.ts\`: Generación automática de cold outreach adaptado para negocios con web y sin web.
- \`types/index.ts\`: Tipos y metadata.
- **Estilos:** Tailwind CSS sin dashboard complejo, fácil de entender.
