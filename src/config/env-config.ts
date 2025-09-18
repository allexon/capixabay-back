// src/config/env-config.ts (Back-end)
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

type TEnvKeys = 'DEV' | 'LOCAL_PROD' | 'PROD'

const fnDev = (env: Record<string, string | undefined>) => {
    const portBack = Number(env.DEV_PORT_BACK)
    const portFront = Number(env.DEV_PORT_FRONT)

    // Exemplo de domínios completos:
    // -> http://app.localhost:3000
    // -> http://back.localhost:3001
    // -> http://192.168.0.6:3000

    const allowedOrigins = [
        `http://app.${env.DEV_DOMAIN}:${portFront}`,
        `http://back.${env.DEV_DOMAIN}:${portBack}`,
        'http://localhost',
        'http://127.0.0.1',
        env.DEV_MOBILE ? `http://${env.DEV_MOBILE}:${portFront}` : ''
    ].filter(Boolean) as string[]

    return {
        NODE_ENV: 'DEV' as TEnvKeys,
        PORT: portBack,
        ZOHO_EMAIL: env.DEV_ZOHO_EMAIL,
        ZOHO_PASSWORD: env.DEV_ZOHO_PASSWORD,
        MONGO_DB_NAME: env.DEV_MONGO_DB_NAME,
        MONGO_DB_URL: env.DEV_MONGO_DB_URL,
        FRONTEND_URL: `http://app.${env.DEV_DOMAIN}:${portFront}`,
        BACKEND_URL: `http://back.${env.DEV_DOMAIN}:${portBack}`,
        ALLOWED_ORIGINS: allowedOrigins,
    }
}

const fnLocalProd = (env: Record<string, string | undefined>) => {
    const port = Number(env.LOCAL_PROD_PORT)
    const domain = env.LOCAL_PROD_DOMAIN!

    // Exemplo de domínios completos:
    // -> http://app.capixabay.com.br:3002
    // -> http://back.capixabay.com.br:3002
    return {
        NODE_ENV: 'LOCAL_PROD' as TEnvKeys,
        PORT: port,
        ZOHO_EMAIL: env.LOCAL_PROD_ZOHO_EMAIL,
        ZOHO_PASSWORD: env.LOCAL_PROD_ZOHO_PASSWORD,
        MONGO_DB_NAME: env.LOCAL_PROD_MONGO_DB_NAME,
        MONGO_DB_URL: env.LOCAL_PROD_MONGO_DB_URL,
        FRONTEND_URL: `http://app.${domain}:${port}`,
        BACKEND_URL: `http://back.${domain}:${port}`,
        ALLOWED_ORIGINS: [`http://app.${domain}:${port}`, `http://back.${domain}:${port}`]
    }
}

const fnProd = (env: Record<string, string | undefined>) => {
    const port = Number(env.PROD_PORT)
    const domain = env.PROD_DOMAIN!

    // Exemplo de domínios completos:
    // -> https://app.capixabay.com.br:3003
    // -> https://back.capixabay.com.br:3003
    return {
        NODE_ENV: 'PROD' as TEnvKeys,
        PORT: port,
        ZOHO_EMAIL: env.PROD_ZOHO_EMAIL,
        ZOHO_PASSWORD: env.PROD_ZOHO_PASSWORD,
        MONGO_DB_NAME: env.PROD_MONGO_DB_NAME,
        MONGO_DB_URL: env.PROD_MONGO_DB_URL,
        FRONTEND_URL: `https://app.${domain}`,
        BACKEND_URL: `https://back.${domain}`,
        ALLOWED_ORIGINS: [`https://app.${domain}`, `https://back.${domain}`]
    }
}

const nodeEnv = (process.env.NODE_ENV as TEnvKeys) ?? 'DEV'
let envConfig: ReturnType<typeof fnDev>

switch (nodeEnv) {
    case 'DEV': envConfig = fnDev(process.env); break;
    case 'LOCAL_PROD': envConfig = fnLocalProd(process.env); break;
    case 'PROD': envConfig = fnProd(process.env); break;
    default: envConfig = fnDev(process.env); break;
}

export const ENV = envConfig