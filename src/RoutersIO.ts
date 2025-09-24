// src/RoutersIO.ts
import { Server, Socket } from 'socket.io'
import { rotasDinamicasIO } from '@/sockets/IO'

type TTipoDataSocket = (data: any, socket: Socket, io?: Server) => Promise<void>

export const RoutersIO = async (io: Server) => {
    io.on('connection', (socket: Socket) => {
        //console.log('✅ ::: NOVO SOCKET ::::')

        rotasDinamicasIO.forEach(({ canal, local, fn }) => {
            if (!local || !fn) {
                console.warn(`[RoutersIO] Ignorando canal '${canal}' porque arquivo ou função é nula`)
                return
            }

            socket.on(canal, async (data: any) => {
                try {
                    const _import = await import(local)
                    const _handler = _import[fn] as TTipoDataSocket

                    if (typeof _handler !== 'function') {
                        throw new Error(`Função '${fn}' não encontrada em '${local}'`)
                    }

                    if (_handler.length === 3) {
                        await _handler(data, socket, io)
                    } else {
                        await _handler(data, socket)
                    }
                } catch (error) {
                    console.error(`❌ Erro no canal [${canal}] vindo de [${local}]`, error)
                }
            })
        })

        socket.on('disconnect', (reason) => {
            console.warn(`❌ Cliente desconectado: ${socket.id}, motivo: ${reason}`)
        })
    })
}