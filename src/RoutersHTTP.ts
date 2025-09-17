// RoutersHTTP.ts
import { Express, Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import path from 'path'
import { PATH_HTTP } from '@/path-http/PATH-HTTP'
import { ENV } from '@/config/env-config' // <-- Adicione esta linha

type THttpHandler = (req: Request, res: Response, io: SocketIOServer) => void

const resolvePath = (aliasPath: string) => {
    const isDev = ENV.IS_DEV
    const rootDir = path.resolve(__dirname, '..')
    const _relativePath = aliasPath.replace(/^@\//, '')
    const finalPath = isDev ? path.resolve(rootDir, 'src', _relativePath) : path.resolve(rootDir, 'dist', _relativePath)
    return isDev ? finalPath + '.ts' : finalPath + '.js'
}

export const RoutersHTTP = (app: Express, io: SocketIOServer) => {
    PATH_HTTP.forEach(async ({ uri, local, fn, method = 'GET' }) => {
        try {
            const _caminho = resolvePath(local)
            const _import = await import(_caminho)
            const handler = _import[fn] as THttpHandler

            if (typeof handler !== 'function') {
                throw new Error(`Função '${fn}' não encontrada em '${local}'`)
            }

            const fullPath = `/api/${uri}`

            if (method === 'GET') {
                app.get(fullPath, (req, res) => {
                    try {
                        handler(req, res, io)
                    } catch (error) {
                        console.error(`❌ Erro na rota GET ${fullPath}`, error)
                        res.status(500).json({ status: 'error', message: 'Erro interno do servidor' })
                    }
                })
            } else if (method === 'POST') {
                app.post(fullPath, (req, res) => {
                    try {
                        handler(req, res, io)
                    } catch (error) {
                        console.error(`❌ Erro na rota POST ${fullPath}`, error)
                        res.status(500).json({ status: 'error', message: 'Erro interno do servidor' })
                    }
                })
            }

            console.log(`📡 Rota HTTP registrada: [${method}] ${fullPath}`)
        } catch (err) {
            console.error(`❌ Erro ao registrar rota HTTP '${uri}'`, err)
        }
    })
}