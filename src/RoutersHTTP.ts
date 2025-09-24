//src/RoutersHTTP
import { Express, Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { PATH_HTTP } from '@/path-http/PATH-HTTP'
import path from 'path'

// Definição do tipo THttpHandler
type THttpHandler = (req: Request, res: Response, io: SocketIOServer) => void

const isDev = process.env.NODE_ENV !== 'PROD' // Ajustado para 'PROD' conforme .env-prod

export const RoutersHTTP = async (app: Express, io: SocketIOServer) => {
  for (const { uri, local, fn, method = 'GET' } of PATH_HTTP) {
    try {
      // 🔑 Corrige path absoluto dependendo do ambiente
      let fullPath: string
      if (isDev) {
        // DEV: path relativo normal
        fullPath = path.resolve(__dirname, local.replace(/^@\//, ''))
      } else {
        // PROD: assume que os arquivos já estão no build JS (dist) em path-http
        // remove @/ e garante extensão .js
        let correctedLocal = local.replace(/^@\//, '')
        if (!correctedLocal.endsWith('.js')) correctedLocal += '.js'
        fullPath = path.resolve(__dirname, correctedLocal)
      }

      //console.log(`📡 Tentando importar módulo: ${fullPath}`)

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