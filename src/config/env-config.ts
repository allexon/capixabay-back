// src/config/env-config.ts (backend)
// src/config/env-config.ts (backend)
import dotenv from 'dotenv'
import path from 'path'

type TEnvKeys = 'DEV' | 'PROD'

type TEnvConfig = {
    NODE_ENV: TEnvKeys
    PORT: number
    ZOHO_EMAIL?: string
    ZOHO_PASSWORD?: string
    MONGO_DB_NAME?: string
    MONGO_DB_URL?: string
    front: string
    back: string
    wsFrontBack: string
    front_IP?: string
    back_IP?: string
    wsFrontBack_IP?: string
    ALLOWED_ORIGINS: string[]
}

let instance: TEnvConfig | null = null

const createConfig = (): TEnvConfig => {
    if (process.env.NODE_ENV === 'DEV' && !process.env.PORT_BACK) {
        const envFile = `.env.${process.env.NODE_ENV.toLowerCase()}`
        dotenv.config({ path: path.resolve(process.cwd(), envFile) })
        console.log(`💡 Variáveis de ambiente de ${envFile} carregadas para o ambiente DEV.`)
    }

    const nodeEnv = (process.env.NODE_ENV?.toUpperCase().replace('_', '-') || 'DEV') as TEnvKeys
    const PORT = Number(process.env.PORT_BACK) || 3003
    const ZOHO_EMAIL = process.env.ZOHO_EMAIL
    const ZOHO_PASSWORD = process.env.ZOHO_PASSWORD
    const MONGO_DB_NAME = process.env.MONGO_DB_NAME
    const MONGO_DB_URL = process.env.MONGO_DB_URL

    if (nodeEnv === 'DEV') {
        const portFront = Number(process.env.DEV_PORT_FRONT) || 3000
        const domain = process.env.DEV_DOMAIN || 'localhost'
        const ip = process.env.DEV_MOBILE

        return {
            NODE_ENV: 'DEV',
            PORT,
            ZOHO_EMAIL,
            ZOHO_PASSWORD,
            MONGO_DB_NAME,
            MONGO_DB_URL,
            front: `http://app.${domain}:${portFront}`,
            back: `http://back.${domain}:${PORT}`,
            wsFrontBack: `ws://back.${domain}:${PORT}`,
            front_IP: ip ? `http://${ip}:${portFront}` : undefined,
            back_IP: ip ? `http://${ip}:${PORT}` : undefined,
            wsFrontBack_IP: ip ? `ws://${ip}:${PORT}` : undefined,
            ALLOWED_ORIGINS: [
                `http://localhost:${portFront}`,
                `http://127.0.0.1:${portFront}`,
                ip ? `http://${ip}:${portFront}` : '',
            ].filter(Boolean) as string[],
        }
    }

    if (nodeEnv === 'PROD') {
        const domain = process.env.PROD_DOMAIN || 'capixabay.com.br'
        return {
            NODE_ENV: 'PROD',
            PORT,
            ZOHO_EMAIL,
            ZOHO_PASSWORD,
            MONGO_DB_NAME,
            MONGO_DB_URL,
            front: `https://app.${domain}`,
            back: `https://back.${domain}`,
            wsFrontBack: `wss://back.${domain}`,
            ALLOWED_ORIGINS: [
                `https://app.${domain}`,
                `https://www.app.${domain}`,
                `https://back.${domain}`,
                `https://www.back.${domain}`,
                `https://www.${domain}`,
                `https://${domain}`,
            ],
        }
    }

    const devDomain = process.env.DEV_DOMAIN || 'localhost'
    return {
        NODE_ENV: 'DEV',
        PORT: 3003,
        ZOHO_EMAIL: '',
        ZOHO_PASSWORD: '',
        MONGO_DB_NAME: '',
        MONGO_DB_URL: '',
        front: `http://app.${devDomain}:3000`,
        back: `http://back.${devDomain}:3003`,
        wsFrontBack: `ws://back.${devDomain}:3003`,
        ALLOWED_ORIGINS: [],
    }
}

const getConfig = (): TEnvConfig => {
    if (!instance) {
        instance = createConfig()
    }
    return instance
}

export const ENV = getConfig()



