//src/pages/pedido/ListaPedidosEnviadosAceitos.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { fnPedidosEnviadosAceitos } from '@/pages/pedido/functions/fnPedidosEnviadosAceitos'

const CANAL = IO.LISTA_PEDIDOS_ENVIADOS_ACEITOS
const RESPOSTA_IO = 'LISTA-PEDIDOS-ENVIADOS-ACEITOS'

export const ListaPedidosEnviadosAceitos = async (data: any, socket: Socket) => {
    try {
        const usuario_id = data.usuario_id.toString()
        if (!usuario_id) {
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
        }

        const resPedidos = await fnPedidosEnviadosAceitos(usuario_id)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-OK`, resPedidos)
    } catch (error: any) {
        console.error('❌ Erro em fnListarPedidosEnviadosAceitos:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}