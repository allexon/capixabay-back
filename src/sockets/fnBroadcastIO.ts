// src/sockets/fnBroadcastIO.ts
import { Socket } from 'socket.io'
import { repostasIO, type TResposta } from './resposta-io'

// Esta tipagem garante que a resposta final tem todas as propriedades da TResposta
// e, opcionalmente, a propriedade 'data'.
export type IRespostaIO<T = any> = TResposta & { data?: T | null }

/**
 * Envia uma resposta pelo socket para um cliente específico
 * @param socket A instância do socket do cliente
 * @param canal O canal (evento) do Socket.IO para emitir
 * @param slug O slug da mensagem
 * @param data Dados opcionais para incluir na resposta
 */

/**
 * EXEMPLO USO:
 * fnRespostaIO(socket, IO.EMPRESA_CLOSE, 'EMPRESA-CLOSE-OK', data)
 * fnRespostaIO(socket, IO.EMPRESA_CLOSE, 'EMPRESA-CLOSE-ERROR')
 */

export const fnBroadcastIO = <T = any>(socket: Socket, canal: string,  slug: string,  data?: T | null ) => {
  const res = repostasIO.find(res => res.slug === slug)

  if (!res) {
    console.error(`❌ Mensagem do SLUG ${slug} não encontrada.`)
    return
  }
  
  // Cria um objeto base com as informações encontradas
  const resposta: IRespostaIO<T> = {
    slug: res.slug,
    status: res.status,
    comando: res.comando,
    message: res.message,
    data: data, // A propriedade 'data' é adicionada aqui, se 'data' for undefined, ela é ignorada pelo JSON.stringify
  }
  
  socket.broadcast.emit(canal, resposta)
}