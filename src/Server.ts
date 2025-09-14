//src/Server.ts
import net from 'net'
import express, { Express, Request, Response } from 'express'
import { createServer } from 'http'
import { Server as IOServer } from 'socket.io'
import { RoutersIO } from '@/RoutersIO'
import { RoutersHTTP } from '@/RoutersHTTP'
import { ENV } from '@/config/env-config'

const startServer = async () => {
  const PORT = ENV.PORT

  if (isNaN(PORT)) {
    console.error('❌ Porta inválida. Verifique suas variáveis de ambiente de porta.')
    process.exit(1)
  }

  const isPortFree = await checkPort(PORT)
  if (!isPortFree) {
    console.error(`❌ Porta ${PORT} está ocupada!`)
    process.exit(1)
  }

  const app: Express = express()
  const httpServer = createServer(app)

  // Middleware para parsear JSON
  app.use(express.json())

  // Middleware CORS para requisições HTTP
  app.use((req: Request, res: Response, next: () => void) => {
    const origin = req.headers.origin || req.headers.host // Captura origin ou host para maior flexibilidade
    console.log(`🔍 CORS Check - Origin/Host: ${origin}`)

    if (origin && ENV.ALLOWED_ORIGINS.some((allowedOrigin) => {
      // Compara com base em prefixos ou IPs
      return allowedOrigin === origin || 
             (ENV.IS_DEV && allowedOrigin.includes(process.env.IP_LOCALHOST || ''))
    })) {
      res.header('Access-Control-Allow-Origin', origin)
      console.log(`✅ CORS permitido para: ${origin}`)
    } else {
      console.log(`🚫 CORS negado para: ${origin}`)
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
      console.log('🔧 Respondendo a preflight OPTIONS')
      return res.sendStatus(200)
    }
    next()
  })

  // Socket.IO com CORS
  const io = new IOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        console.log(`🔍 Socket.IO CORS Check - Origin: ${origin}`)
        if (!origin) {
          // Permite conexões sem origin (ex.: localhost)
          return callback(null, true)
        }
        const isAllowed = ENV.ALLOWED_ORIGINS.some((allowedOrigin) => 
          allowedOrigin === origin || 
          (ENV.IS_DEV && allowedOrigin.includes(process.env.IP_LOCALHOST || ''))
        )
        callback(null, isAllowed)
        console.log(`✅ Socket.IO CORS ${isAllowed ? 'permitido' : 'negado'} para: ${origin}`)
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  })

  RoutersIO(io)
  RoutersHTTP(app, io)

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Socket.IO e HTTP rodando na porta ${PORT}!`)
  })

  process.on('SIGINT', () => {
    console.log('🛑 Encerrando servidor...')
    httpServer.close(() => {
      console.log('✅ Servidor finalizado com sucesso.')
      process.exit(0)
    })
  })
}

const checkPort = (port: number) => new Promise<boolean>((resolve) => {
  const tester = net.createServer()
    .once('error', () => resolve(false))
    .once('listening', () => tester.once('close', () => resolve(true)).close())
    .listen(port)
})

startServer()