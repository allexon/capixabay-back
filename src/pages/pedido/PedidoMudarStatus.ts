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
        const { pedido_id, pedido_status, usuario_iniciador_id } = data 
        
        if (!pedido_id || !pedido_status || !usuario_iniciador_id) {
             console.error('Dados incompletos recebidos:', data);
             fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`, { message: 'ID do iniciador, pedido ou status faltando.' })
             return
        }

        // 🚨 PASSO 1: O ID do usuário logado é AGORA o ID que veio do frontend
        const usuarioLogadoId = usuario_iniciador_id 
        
        console.log(`✅ Usuário Logado ID (Iniciador): ${usuarioLogadoId}`)
        
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

        // 🔹 Gera o payload para o Comprador (Alexon)
        const pedidosComprador = await fnPedidosEnviadosAceitos(usuarioCompradorId)

        let pedidosVendedor = null
        if (usuarioCompradorId !== usuarioVendedorId) {
             // 🔹 Gera o payload para o Vendedor (Zé do Gás)
            pedidosVendedor = await fnPedidosEnviadosAceitos(usuarioVendedorId)
        }


        // 🎯 PASSO 2: IMPLEMENTAÇÃO DA LÓGICA DINÂMICA (Baseada no Iniciador)
        let iniciadorPayload = null
        let recebedorPayload = null

        // Se quem iniciou é o Comprador (Alexon)
        if (usuarioLogadoId === usuarioCompradorId) {
            iniciadorPayload = pedidosComprador
            recebedorPayload = pedidosVendedor
        } 
        // Se quem iniciou é o Vendedor (Zé do Gás)
        else if (usuarioLogadoId === usuarioVendedorId) {
            iniciadorPayload = pedidosVendedor
            recebedorPayload = pedidosComprador
        } else {
            // Caso de um usuário que não é nem Comprador nem Vendedor do pedido (situação inesperada)
            console.error('ERRO DE SEGURANÇA: Usuário logado não é parte desta transação. ID:', usuarioLogadoId)
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`, { message: 'Usuário logado não é parte desta transação.' })
            return
        }
        
        // 3. Envia para o INICIADOR (fnRespostaIO) - Só ele vai receber este socket
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-OK`, iniciadorPayload)

        // 4. Envia para o RECEBEDOR (fnBroadcastIO) - Todos os sockets ativos do recebedor
        if (recebedorPayload) {
            fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, recebedorPayload)
        }

    } catch (error: any) {
        console.error('❌ Erro em PedidoMudarStatus:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}