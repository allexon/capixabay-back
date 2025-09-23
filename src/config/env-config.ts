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

// --- Início do Padrão Singleton ---
let instance: TEnvConfig | null = null

const createConfig = (): TEnvConfig => {
    console.log('--- CRIANDO CONFIGURAÇÃO DE AMBIENTE PELA PRIMEIRA VEZ ---')

    // Lógica para carregar o arquivo .env apenas em ambiente DEV
    if (process.env.NODE_ENV === 'DEV' && !process.env.PORT_BACK) {
        const envFile = `.env.${process.env.NODE_ENV.toLowerCase()}`
        dotenv.config({ path: path.resolve(process.cwd(), envFile) })
        console.log(`💡 Variáveis de ambiente de ${envFile} carregadas para o ambiente DEV.`)
    }

    const nodeEnv = (process.env.NODE_ENV?.toUpperCase().replace('_', '-') || 'DEV') as TEnvKeys

    const PORT = Number(process.env.PORT_BACK)
    const ZOHO_EMAIL = process.env.ZOHO_EMAIL
    const ZOHO_PASSWORD = process.env.ZOHO_PASSWORD
    const MONGO_DB_NAME = process.env.MONGO_DB_NAME
    const MONGO_DB_URL = process.env.MONGO_DB_URL

    /*
    DEV:
        - front:          http://app.localhost:3000
        - back:           http://back.localhost:3001
        - wsFrontBack:    ws://back.localhost:3001
    */
    if (nodeEnv === 'DEV') {
        const portFront = Number(process.env.DEV_PORT_FRONT)
        const domain = process.env.DEV_DOMAIN!
        const ip = process.env.DEV_MOBILE

        return {
            NODE_ENV: 'DEV', PORT, ZOHO_EMAIL, ZOHO_PASSWORD, MONGO_DB_NAME, MONGO_DB_URL,
            front: `http://app.${domain}:${portFront}`,
            back: `http://back.${domain}:${PORT}`,
            wsFrontBack: `ws://back.${domain}:${PORT}`,
            front_IP: ip ? `http://${ip}:${portFront}` : undefined,
            back_IP: ip ? `http://${ip}:${PORT}` : undefined,
            wsFrontBack_IP: ip ? `ws://${ip}:${PORT}` : undefined,
            ALLOWED_ORIGINS: [
                `http://app.${domain}:${portFront}`,
                `http://back.${domain}:${PORT}`,
                'http://localhost',
                'http://127.0.0.1',
                ip ? `http://${ip}:${portFront}` : ''
            ].filter(Boolean) as string[]
        }
    }

    /*
    PROD:
        - front:          https://app.capixabay.com.br
        - back:           https://back.capixabay.com.br
        - wsFrontBack:    wss://back.capixabay.com.br
    */
    if (nodeEnv === 'PROD') {
        const domain = process.env.PROD_DOMAIN!
        return {
            NODE_ENV: 'PROD', PORT, ZOHO_EMAIL, ZOHO_PASSWORD, MONGO_DB_NAME, MONGO_DB_URL,
            front: `https://app.${domain}`,
            back: `https://back.${domain}`,
            wsFrontBack: `wss://back.${domain}`,
            ALLOWED_ORIGINS: [
                `https://app.${domain}`,
                `https://back.${domain}`
            ]
        }
    }

    // Fallback de segurança caso NODE_ENV não seja reconhecido
    const devDomain = process.env.DEV_DOMAIN || 'localhost'
    return {
        NODE_ENV: 'DEV',
        PORT: 3001,
        ZOHO_EMAIL: '', ZOHO_PASSWORD: '', MONGO_DB_NAME: '', MONGO_DB_URL: '',
        front: `http://app.${devDomain}:3000`,
        back: `http://back.${devDomain}:3001`,
        wsFrontBack: `ws://back.${devDomain}:3001`,
        ALLOWED_ORIGINS: []
    }
}

const getConfig = (): TEnvConfig => {
    if (!instance) {
        instance = createConfig()
    }
    return instance
}

export const ENV = getConfig()
