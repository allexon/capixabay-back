import { Server, Socket } from 'socket.io'
import path from 'path'
import { rotasDinamicasIO } from '@/sockets/IO'

// Ajusta resolvePath para não duplicar 'src'
const resolvePath = (aliasPath: string) => {
  const _relativePath = aliasPath.replace(/^@\//, '') // Remove o '@/' do início
  return path.resolve(__dirname, _relativePath) // Não adiciona 'src' explicitamente
}

// 🔧 Tipagem padrão dos handlers
type TTipoDataSocket = (data: any, socket: Socket, io?: Server) => Promise<void>

export const RoutersIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('✅ Novo cliente conectado')

    // 🔄 Registra todos os canais de forma dinâmica
    rotasDinamicasIO.forEach(({ canal, local, fn }) => {
      if (!local || !fn) {
        console.warn(`[RoutersIO] Ignorando canal '${canal}' porque arquivo ou função é nula`)
        return
      }

      socket.on(canal, async (data: any) => {
        try {
          const _caminho = resolvePath(local)
          const _import = await import(_caminho)
          const _handler = _import[fn] as TTipoDataSocket

          if (typeof _handler !== 'function') {
            throw new Error(`Função '${fn}' não encontrada em '${local}'`)
          }

          // 🧠 Detecta se o handler aceita 3 argumentos e injeta o `io` se necessário
          if (_handler.length === 3) {
            await _handler(data, socket, io) // handler(data, socket, io)
          } else {
            await _handler(data, socket)     // handler(data, socket)
          }

        } catch (error) {
          console.error(`❌ Erro no canal [${canal}] vindo de [${local}]:`, error)
        }
      })
    })

    socket.on('disconnect', (reason) => {
      console.warn(`❌ Cliente desconectado: ${socket.id}, motivo: ${reason}`)
      // fnLimparSocketAtivo(socket)
    })
  })
}