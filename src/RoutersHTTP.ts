//src/RoutersHTTP
import { Express, Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { PATH_HTTP } from '@/path-http/PATH-HTTP'
import path from 'path'

// Definição do tipo THttpHandler
type THttpHandler = (req: Request, res: Response, io: SocketIOServer) => void

const isDev = process.env.NODE_ENV !== 'PROD'

export const RoutersHTTP = async (app: Express, io: SocketIOServer) => {
    for (const { uri, local, fn, method = 'GET' } of PATH_HTTP) {
        try {
            let fullPath: string
            if (isDev) {
                // DEV: Usa tsconfig-paths para resolver o alias @/
                fullPath = local // O ts-node com tsconfig-paths/register já resolve @/
            } else {
                // PROD: Usa o caminho absoluto baseado na raiz do backend
                const basePath = '/home/ubuntu/capixabay/backend'
                let correctedLocal = local.replace(/^@\//, '') // Remove @/ para usar o caminho relativo
                if (!correctedLocal.endsWith('.js')) correctedLocal += '.js' // Garante extensão .js
                fullPath = path.resolve(basePath, correctedLocal)
            }

            console.log(`📡 Tentando importar módulo: ${fullPath}`) // Depuração

            const _import = await import(fullPath)
            const handler = _import[fn] as THttpHandler

            if (typeof handler !== 'function') {
                throw new Error(`Função '${fn}' não encontrada em '${fullPath}'`)
            }

            const routePath = `/api/${uri}`

            if (method === 'GET') {
                app.get(routePath, (req, res) => {
                    try {
                        handler(req, res, io)
                    } catch (error) {
                        console.error(`❌ Erro na rota GET ${routePath}:`, error)
                        res.status(500).json({ status: 'error', message: 'Erro interno do servidor' })
                    }
                })
            } else if (method === 'POST') {
                app.post(routePath, (req, res) => {
                    try {
                        handler(req, res, io)
                    } catch (error) {
                        console.error(`❌ Erro na rota POST ${routePath}:`, error)
                        res.status(500).json({ status: 'error', message: 'Erro interno do servidor' })
                    }
                })
            }

            console.log(`✅ Rota HTTP registrada: [${method}] ${routePath}`)
        } catch (err) {
            console.error(`❌ Erro ao registrar rota HTTP '${uri}':`, err)
        }
    }
}