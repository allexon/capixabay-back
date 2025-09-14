// src/config/env-config (backend)
import dotenv from 'dotenv'
import path from 'path'

// Carrega sempre do .env padrão
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const rawMode = process.env.ENV_MODE || 'development'
const NODE_ENV = process.env.NODE_ENV || rawMode
const isProd = NODE_ENV === 'production'
const isDev = NODE_ENV === 'development'

const DOMAIN = isProd ? process.env.DOMAIN_PROD : process.env.DOMAIN_DEV
const PORT = isProd ? Number(process.env.PORT_PROD) : Number(process.env.PORT_DEV)
const baseURL = `${DOMAIN}:${PORT}`

console.log(`🌍 Ambiente: ${NODE_ENV.toUpperCase()}`)
console.log(`🔗 BaseURL: ${baseURL}`)

// Verifica se IP_LOCALHOST está definido e usa como fallback para testes na rede local
const ipLocalhost = process.env.IP_LOCALHOST || 'localhost'

export const ENV = {
    // Mongo
    MONGO_URL: process.env.MONGO_URL as string,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME as string,

    // Email
    ZOHO_EMAIL: process.env.ZOHO_EMAIL as string,
    ZOHO_PASSWORD: process.env.ZOHO_PASSWORD as string,

    // Base URLs
    HTTP_URL: `http://${baseURL}`,
    HTTPS_URL: `https://${baseURL}`,
    WS_URL: `ws://${baseURL}`,
    WSS_URL: `wss://${baseURL}`,

    // Porta
    PORT,

    // CORS
    ALLOWED_ORIGINS: [
        `http://${baseURL}`,
        `https://${baseURL}`,
        `ws://${baseURL}`,
        `wss://${baseURL}`,
        ...(isDev ? [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://capixabay.local:5173',
            `http://${ipLocalhost}:5173`, // Frontend no celular via IP
            `ws://${ipLocalhost}:3000`,   // WebSocket para backend via IP
            `wss://${ipLocalhost}:3000`,  // WebSocket seguro via IP
            `http://${ipLocalhost}:3000`, // Backend acessível via IP
            `https://${ipLocalhost}:3000` // Backend acessível via IP (se aplicável)
        ] : [])
    ],

    MODE: NODE_ENV,
    IS_DEV: isDev,
    IS_PROD: isProd
}