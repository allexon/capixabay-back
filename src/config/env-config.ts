// src/config/env-config.ts (Back-end)
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const nodeEnv = process.env.NODE_ENV
const isDev = nodeEnv === 'DEV'
const isProd = nodeEnv === 'PROD'
const isProdLocal = nodeEnv === 'PROD_LOCAL'

// A porta do back-end
let port: number
if (isDev) {
    port = Number(process.env.DEV_BACK_PORT)
} else if (isProdLocal) {
    port = Number(process.env.PROD_PORT_LOCAL)
} else if (isProd) {
    port = Number(process.env.PROD_PORT)
} else {
    port = Number(process.env.DEV_BACK_PORT)
}

// Domínios
const frontDomain = process.env.FRONT_PREFIX + '.' + process.env.DOMAIN
const backDomain = process.env.BACK_PREFIX + '.' + process.env.DOMAIN

export const ENV = {
    // Variáveis de ambiente
    PORT: port,
    MONGO_URL: isProd ? process.env.PROD_MONGODB as string : process.env.DEV_MONGODB as string,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME as string,
    ZOHO_EMAIL: process.env.ZOHO_EMAIL as string,
    ZOHO_PASSWORD: process.env.ZOHO_PASSWORD as string,
    DEV_MOBILE: process.env.DEV_MOBILE as string,

    // Lógica do ambiente
    IS_DEV: isDev,
    IS_PROD: isProd,
    MODE: nodeEnv,

    // URLs da aplicação
    FRONTEND_URL: isDev ? `http://${frontDomain}:${process.env.DEV_FRONT_PORT}` : `https://${frontDomain}`,
    BACKEND_URL: isDev ? `http://${backDomain}:${process.env.DEV_BACK_PORT}` : `https://${backDomain}`,

    // CORS
    ALLOWED_ORIGINS: [
        `http://${frontDomain}:${process.env.DEV_FRONT_PORT}`,
        `http://localhost:${process.env.DEV_FRONT_PORT}`,
        `http://127.0.0.1:${process.env.DEV_FRONT_PORT}`,
        ...(isDev ? [`http://${process.env.DEV_MOBILE}:${process.env.DEV_FRONT_PORT}`] : []),
        `http://${backDomain}:${port}` // Permite a comunicação do próprio back-end
    ]
}