import { Express, Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { PATH_HTTP } from '@/path-http/PATH-HTTP'
import path from 'path'

type THttpHandler = (req: Request, res: Response, io: SocketIOServer) => void

export const RoutersHTTP = async (app: Express, io: SocketIOServer) => {
    for (const { uri, local, fn, method = 'GET' } of PATH_HTTP) {    
        try {
            // 🔑 monta caminho absoluto (funciona no dev e no build)
            const correctedLocal = local.replace(/^@\//, '') // remove @/ se houver
            const fullPath = path.resolve(__dirname, correctedLocal)

            console.log(`📡 Tentando importar módulo: ${fullPath}`)

            const _import = await import(fullPath)
            const handler = _import[fn] as THttpHandler

            if (typeof handler !== 'function') {
                throw new Error(`Função '${fn}' não encontrada em '${fullPath}'`)
            }

            const routePath = `/api/${uri}`            
            console.log(`📡 Registrando rota: [${method}] ${routePath}`)

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
