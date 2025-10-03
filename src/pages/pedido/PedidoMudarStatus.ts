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
        // 🚨 CAMPO RECEBIDO DO FRONTEND (quem clicou no botão)
        const { pedido_id, pedido_status } = data

        if (!pedido_id || !pedido_status) {
            console.error('Dados incompletos recebidos:', data)
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

        // 🔹 Identifica Comprador e Vendedor
        const usuarioCompradorId = pedidoAtualizado.produtos?.[0]?.usuario_comprador_id ?? ''
        const usuarioVendedorId = pedidoAtualizado.produtos?.[0]?.usuario_vendedor_id

        let pedidos = null
        if (usuarioCompradorId === usuarioVendedorId) {
            // Caso 1: Usuário compra dele mesmo (Comprador/Vendedor são o mesmo)
            // Retornamos um único objeto com uma chave clara.
            const pedidosCompradorVendedor = await fnPedidosEnviadosAceitos(usuarioCompradorId)
            pedidos = { pedidosCompradorVendedor: pedidosCompradorVendedor }
            //console.log(':::: 1 VENDEDOR/COMPRADOR MESMA PESSOAS ::::', pedidos)
            fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidos)
        } else {
            // Caso 2: Transação normal (Comprador e Vendedor são diferentes)
            const pedidosComprador = await fnPedidosEnviadosAceitos(usuarioCompradorId)
            const pedidosVendedor = await fnPedidosEnviadosAceitos(usuarioVendedorId)
            pedidos = { pedidosComprador: pedidosComprador, pedidosVendedor: pedidosVendedor }
            //console.log(':::: 2 VENDEDOR/COMPRADOR PESSOAS != DIFERENTES ::::', pedidos)
            fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidos)
        }
    } catch (error: any) {
        console.error('❌ Erro em PedidoMudarStatus:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}