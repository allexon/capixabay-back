//src/pages/pedido/PedidoMudarStatus.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { ObjectId, ReadConcern, ReadPreference } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { fnBroadcastIO } from '@/sockets/fnBroadcastIO'
import { fnPedidosEnviadosAceitos } from '@/pages/pedido/functions/fnPedidosEnviadosAceitos'

export const PedidoMudarStatus = async (data: any, socket: Socket) => {
    const { PEDIDOS } = await fnConnectDirectCollection()
    const replicaSetParams = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }

    const CANAL = IO.PEDIDO_MUDAR_STATUS
    const RESPOSTA_IO = 'PEDIDO-MUDAR-STATUS'

    try {
        const { pedido_id, pedido_status } = data
        if (!pedido_id || !pedido_status) {
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
            return
        }

        // 🔹 Atualiza pedido e produtos
        const result = await PEDIDOS.updateOne(
            { _id: new ObjectId(pedido_id) },
            {
                $set: {
                    status: pedido_status,
                    'produtos.$[].produto_status': pedido_status,
                    atualizado_em: new Date(),
                }
            },
            replicaSetParams
        )

        if (result.modifiedCount === 0) {
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
            return
        }

        // 🔹 Busca pedido atualizado
        const pedidoAtualizado = await PEDIDOS.findOne({ _id: new ObjectId(pedido_id) })
        if (!pedidoAtualizado) {
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
            return
        }
        
        let usuarioCompradorId = pedidoAtualizado.produtos?.[0]?.usuario_comprador_id?? ''
        let usuarioVendedorId = pedidoAtualizado.produtos?.[0]?.usuario_vendedor_id

        // 🔹 Totalização do comprador
        const pedidosComprador = await fnPedidosEnviadosAceitos(usuarioCompradorId)

        let pedidosVendedor = null
        if (usuarioCompradorId !== usuarioVendedorId) {
            pedidosVendedor = await fnPedidosEnviadosAceitos(usuarioVendedorId)
        }

        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidosVendedor)
        fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidosComprador)       

    } catch (error: any) {
        console.error('❌ Erro em PedidoMudarStatus:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}