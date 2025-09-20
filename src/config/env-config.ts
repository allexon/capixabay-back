//src/config/env-connfig.ts (backend)
import dotenv from 'dotenv'
import path from 'path'

// Carrega o arquivo .env conforme NODE_ENV
const envFile = `.env.${process.env.NODE_ENV?.toLowerCase().replace('_', '-') || 'dev'}`
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

type TEnvKeys = 'DEV' | 'LOCAL-PROD' | 'PROD'

type TEnvConfig = {
    NODE_ENV: TEnvKeys
    PORT: number
    ZOHO_EMAIL: string | undefined
    ZOHO_PASSWORD: string | undefined
    MONGO_DB_NAME: string | undefined
    MONGO_DB_URL: string | undefined
    front: string
    back: string
    wsFrontBack: string
    front_IP?: string
    back_IP?: string
    wsFrontBack_IP?: string
    ALLOWED_ORIGINS: string[]
}

// Normaliza NODE_ENV para o switch, sempre com hífen
const normalizeEnv = (env: string | undefined): TEnvKeys => {
    if (!env) return 'DEV'
    const normalized = env.toUpperCase().replace('_', '-')
    if (normalized === 'LOCAL-PROD') return 'LOCAL-PROD'
    if (normalized === 'PROD') return 'PROD'
    return 'DEV'
}

/*
    DEV:
        - front:           http://app.localhost:3000
        - back:            http://back.localhost:3001
        - wsFrontBack:     ws://back.localhost:3001

        - front_IP:        http://192.168.0.6:3000
        - back_IP:         http://192.168.0.6:3001
        - wsFrontBack_IP:  ws://192.168.0.6:3001
*/
const fnDev = (env: Record<string, string | undefined>): TEnvConfig => {
    const portBack = Number(env.PORT_BACK)
    const portFront = Number(env.DEV_PORT_FRONT)
    const ip = env.DEV_MOBILE

    const allowedOrigins = [
        `http://app.${env.DEV_DOMAIN}:${portFront}`,
        `http://back.${env.DEV_DOMAIN}:${portBack}`,
        'http://localhost',
        'http://127.0.0.1',
        ip ? `http://${ip}:${portFront}` : ''
    ].filter(Boolean) as string[]

    console.info(`::: WS BACK :::::: ws://back.${env.DEV_DOMAIN}:${portBack}`)

    return {
        NODE_ENV: 'DEV',
        PORT: portBack,
        ZOHO_EMAIL: env.DEV_ZOHO_EMAIL,
        ZOHO_PASSWORD: env.DEV_ZOHO_PASSWORD,
        MONGO_DB_NAME: env.DEV_MONGO_DB_NAME,
        MONGO_DB_URL: env.DEV_MONGO_DB_URL,
        front: `http://app.${env.DEV_DOMAIN}:${portFront}`,
        back: `http://back.${env.DEV_DOMAIN}:${portBack}`,
        wsFrontBack: `ws://back.${env.DEV_DOMAIN}:${portBack}`,
        front_IP: ip ? `http://${ip}:${portFront}` : undefined,
        back_IP: ip ? `http://${ip}:${portBack}` : undefined,
        wsFrontBack_IP: ip ? `ws://${ip}:${portBack}` : undefined,
        ALLOWED_ORIGINS: allowedOrigins,
    }
}

/*
    LOCAL-PROD:
        - front:           http://app.capixabay.com.br:3002
        - back:            http://back.capixabay.com.br:3002
        - wsFrontBack:     ws://back.capixabay.com.br:3002

        - front_IP:        http://192.168.0.6:3002
        - back_IP:         http://192.168.0.6:3002
        - wsFrontBack_IP:  ws://192.168.0.6:3002
*/
const fnLocalProd = (env: Record<string, string | undefined>): TEnvConfig => {
    const portBack = Number(env.PORT_BACK)
    const domain = env.LOCAL_PROD_DOMAIN!
    const ip = env.LOCAL_PROD_MOBILE

    // 1. Primeiro, criamos a lista de origens permitidas
    const allowedOrigins = [
        `http://app.${domain}`,
        `http://app.${domain}:${portBack}`,
        `http://back.${domain}:${portBack}`,
        ip ? `http://${ip}:${portBack}` : undefined
    ].filter(Boolean) as string[];

    // 2. AGORA SIM, nós imprimimos a lista que acabamos de criar
    console.log('--- DIAGNÓSTICO DE ORIGENS PERMITIDAS ---', allowedOrigins);

    // 3. Finalmente, retornamos o objeto de configuração
    return {
        NODE_ENV: 'LOCAL-PROD',
        PORT: portBack,
        ZOHO_EMAIL: env.LOCAL_PROD_ZOHO_EMAIL,
        ZOHO_PASSWORD: env.LOCAL_PROD_ZOHO_PASSWORD,
        MONGO_DB_NAME: env.LOCAL_PROD_MONGO_DB_NAME,
        MONGO_DB_URL: env.LOCAL_PROD_MONGO_DB_URL,
        front: `http://app.${domain}:${portBack}`,
        back: `http://back.${domain}:${portBack}`,
        wsFrontBack: `ws://back.${env.LOCAL_PROD_DOMAIN}:${portBack}`,
        front_IP: ip ? `http://${ip}:${portBack}` : undefined,
        back_IP: ip ? `http://${ip}:${portBack}` : undefined,
        wsFrontBack_IP: ip ? `ws://${ip}:${portBack}` : undefined,
        ALLOWED_ORIGINS: allowedOrigins // Usamos a variável aqui
    }
}

/*
    PROD:
        - front:           https://app.capixabay.com.br
        - back:            https://back.capixabay.com.br
        - wsFrontBack:     wss://back.capixabay.com.br
*/
const fnProd = (env: Record<string, string | undefined>): TEnvConfig => {
    const port = Number(env.PORT_BACK)
    const domain = env.PROD_DOMAIN!

    return {
        NODE_ENV: 'PROD',
        PORT: port,
        ZOHO_EMAIL: env.PROD_ZOHO_EMAIL,
        ZOHO_PASSWORD: env.PROD_ZOHO_PASSWORD,
        MONGO_DB_NAME: env.PROD_MONGO_DB_NAME,
        MONGO_DB_URL: env.PROD_MONGO_DB_URL,
        front: `https://app.${domain}`,
        back: `https://back.${domain}`,
        wsFrontBack: `wss://back.${domain}`,
        ALLOWED_ORIGINS: [
            `https://app.${domain}`,
            `https://back.${domain}`
        ]
    }
}

const nodeEnv = normalizeEnv(process.env.NODE_ENV)
let envConfig: TEnvConfig

switch (nodeEnv) {
    case 'DEV': envConfig = fnDev(process.env); break;
    case 'LOCAL-PROD': envConfig = fnLocalProd(process.env); break;
    case 'PROD': envConfig = fnProd(process.env); break;
    default: envConfig = fnDev(process.env); break;
}

export const ENV = envConfig