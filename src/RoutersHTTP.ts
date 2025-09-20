// RoutersHTTP.ts
import { Express, Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import path from 'path'
import { PATH_HTTP } from '@/path-http/PATH-HTTP'
import { ENV } from '@/config/env-config'

type THttpHandler = (req: Request, res: Response, io: SocketIOServer) => void

/*
const resolvePath = (aliasPath: string) => {
    const isDev = ENV.NODE_ENV === 'DEV'
    const rootDir = path.resolve(__dirname, '..')
    const _relativePath = aliasPath.replace(/^@\//, '')
    const finalPath = isDev ? path.resolve(rootDir, 'src', _relativePath) : path.resolve(rootDir, 'dist', _relativePath)
    return isDev ? finalPath + '.ts' : finalPath + '.js'
}
*/

const resolvePath = (aliasPath: string) => {
    const isDev = ENV.NODE_ENV === 'DEV';
    const relativePath = aliasPath.replace(/^@\//, ''); // Remove o '@/' -> 'pages/login/Login'

    if (isDev) {
        // Em DEV, o __dirname está em /dist/config. Subimos 2 níveis para a raiz e entramos em /src
        return path.join(__dirname, '..', '..', 'src', relativePath + '.ts');
    } else {
        // Em PROD, o __dirname está em /deploy/backend/config. Subimos 1 nível para /deploy/backend
        return path.join(__dirname, '..', relativePath + '.js');
    }
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

            // 💡 CORREÇÃO AQUI:
            // O fullPath deve ser apenas o caminho da URL, sem o domínio.
            const fullPath = `/api/${uri}`
            console.log(':::: O QUE EM FULL PATH back :::: ', fullPath)

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