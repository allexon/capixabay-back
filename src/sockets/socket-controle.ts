// src/sockets/socket-controle.ts
import type { Socket } from 'socket.io'
import { fnStatesRequisicaoIO } from '@/sockets/requisicao-io'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'

let socketAtivo: Socket | null = null
export const fnSetSocketAtivo = (s: Socket) => {
  if (!s?.id) return
  socketAtivo = s
  //console.log(`[SocketControle] Socket ativo definido: ${s.id}`)
}

export const fnLimparSocketAtivo = (s: Socket) => {
  if (!s?.id) return
  if (socketAtivo?.id === s.id) {
    socketAtivo = null
    //console.log('[SocketControle] Socket ativo limpo após desconexão:', s.id)
  }
}

export const fnGetSocketAtivo = (): Socket | null => {
  return socketAtivo
}

// 👇 Nome deve ser exatamente igual ao campo "funcao" em rotasDinamicasIO
export const SocketIdControle = async (data: any, socket: Socket) => {
  fnSetSocketAtivo(socket)

  const { data: requisicaoData } = fnStatesRequisicaoIO<{ socketId: string }>(data)  
  fnRespostaIO(socket, '', 'SOCKET-ID-OK', socket.id)  
}