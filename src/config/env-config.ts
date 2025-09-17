// src/config/env-config.ts (Back-end)
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

type EnvType = {
    NODE_ENV: 'DEV' | 'PROD_LOCAL' | 'PROD'
    DOMAIN: string
    FRONT_PREFIX: string
    BACK_PREFIX: string
    PORT: number
    ZOHO_EMAIL: string
    ZOHO_PASSWORD: string
    MONGO_DB_NAME: string
    MONGODB_URL: string
    DEV_MOBILE?: string
}

const envMapping: Record<string, EnvType> = {
    DEV: {
        NODE_ENV: 'DEV',
        DOMAIN: process.env.DEV_DOMAIN!,
        FRONT_PREFIX: 'app',
        BACK_PREFIX: 'back',
        PORT: Number(process.env.DEV_PORT!),
        ZOHO_EMAIL: process.env.DEV_ZOHO_EMAIL!,
        ZOHO_PASSWORD: process.env.DEV_ZOHO_PASSWORD!,
        MONGO_DB_NAME: process.env.DEV_LOCAL_MONGODB_NAME!,
        MONGODB_URL: process.env.DEV_LOCAL_MONGODB_URL!,
        DEV_MOBILE: process.env.DEV_MOBILE!,
    },
    PROD_LOCAL: {
        NODE_ENV: 'PROD_LOCAL',
        DOMAIN: process.env.PROD_LOCAL_DOMAIN!,
        FRONT_PREFIX: 'app',
        BACK_PREFIX: 'back',
        PORT: Number(process.env.PROD_LOCAL_PORT!),
        ZOHO_EMAIL: process.env.PROD_LOCAL_ZOHO_EMAIL!,
        ZOHO_PASSWORD: process.env.PROD_LOCAL_ZOHO_PASSWORD!,
        MONGO_DB_NAME: process.env.PROD_LOCAL_MONGODB_NAME!,
        MONGODB_URL: process.env.PROD_LOCAL_MONGODB_URL!,
    },
    PROD: {
        NODE_ENV: 'PROD',
        DOMAIN: process.env.PROD_DOMAIN!,
        FRONT_PREFIX: 'app',
        BACK_PREFIX: 'back',
        PORT: Number(process.env.PROD_PORT!),
        ZOHO_EMAIL: process.env.PROD_ZOHO_EMAIL!,
        ZOHO_PASSWORD: process.env.PROD_ZOHO_PASSWORD!,
        MONGO_DB_NAME: process.env.PROD_MONGODB_NAME!,
        MONGODB_URL: process.env.PROD_MONGODB_URL!,
    },
}

// 🔑 Agora só precisa de 1 variável seletora
const nodeEnv = process.env.NODE_ENV as EnvType['NODE_ENV'] || 'DEV'
const envVars = envMapping[nodeEnv]

if (!envVars) {
    throw new Error(`Ambiente desconhecido: ${nodeEnv}`)
}

const isDev = envVars.NODE_ENV === 'DEV'
const protocol = isDev ? 'http' : 'https'
const frontPort = isDev ? `:${envVars.PORT - 1}` : ''
const backPort = isDev ? `:${envVars.PORT}` : ''

export const ENV = {
    PORT: envVars.PORT,
    MONGO_URL: envVars.MONGODB_URL,
    MONGO_DB_NAME: envVars.MONGO_DB_NAME,
    ZOHO_EMAIL: envVars.ZOHO_EMAIL,
    ZOHO_PASSWORD: envVars.ZOHO_PASSWORD,
    DEV_MOBILE: envVars.DEV_MOBILE,

    IS_DEV: isDev,
    IS_PROD_LOCAL: envVars.NODE_ENV === 'PROD_LOCAL',
    IS_PROD: envVars.NODE_ENV === 'PROD',
    MODE: envVars.NODE_ENV,

    FRONTEND_URL: isDev
        ? `${protocol}://${envVars.DOMAIN}${frontPort}`
        : `${protocol}://${envVars.FRONT_PREFIX}.${envVars.DOMAIN}`,

    BACKEND_URL: isDev
        ? `${protocol}://${envVars.DOMAIN}${backPort}`
        : `${protocol}://${envVars.BACK_PREFIX}.${envVars.DOMAIN}`,

    ALLOWED_ORIGINS: [
        isDev
            ? `${protocol}://${envVars.DOMAIN}${frontPort}`
            : `${protocol}://${envVars.FRONT_PREFIX}.${envVars.DOMAIN}`,
        `http://localhost:${envVars.PORT - 1}`,
        `http://127.0.0.1:${envVars.PORT - 1}`,
        ...(isDev && envVars.DEV_MOBILE ? [`http://${envVars.DEV_MOBILE}:${envVars.PORT - 1}`] : []),
    ],
}