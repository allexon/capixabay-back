// ✅ src/sockets/pedido/PedidoNovo.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { ReadConcern, ReadPreference, Db, ClientSession, ObjectId } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnNormalizarEntrada } from '@/functions/fnNormalizarEntrada'
import { fnPedidosEnviadosAceitos } from '@/pages/pedido/functions/fnPedidosEnviadosAceitos'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { fnBroadcastIO } from '@/sockets/fnBroadcastIO'
import { fnSessaoAtomica } from '@/db/fnSessaoAtomica'

export const PedidoNovo = async (data: any, socket: Socket) => {
    const replicaSetParams = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }

    const CANAL = IO.PEDIDO_NOVO
    const RESPOSTA_IO = 'PEDIDO-NOVO'

    try {
        const pedido = fnNormalizarEntrada(data, { transformarId: true })
        if (pedido.length === 0) {
            return fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
        }

        const agora = new Date().toISOString()
        const _pedido = pedido.map((res: any) => ({ ...res, criado_em: agora, atualizado_em: agora }))

        if (_pedido.length === 1) {
            const result = await fnSessaoAtomica(async (db: Db, session: ClientSession) => {
                const { PEDIDOS, USUARIOS } = await fnConnectDirectCollection()

                // --- INSERT pedido ---
                const resInsert = await (PEDIDOS as any).insertOne(_pedido[0], {
                    session,
                    writeConcern: { w: 'majority', wtimeout: 3000 },
                    ...replicaSetParams,
                })
                if (!resInsert.insertedId) throw new Error('❌ Falha ao inserir pedido')

                // --- UPDATE contador_pedido do usuário ---
                const usuarioId = _pedido[0].usuario_id
                if (!usuarioId) throw new Error('❌ Pedido sem usuario_id')

                await (USUARIOS as any).updateOne(
                    { _id: new ObjectId(usuarioId) },
                    { $set: { atualizado_em: new Date() }, $inc: { contador_pedido: 1 } },
                    { session, writeConcern: { w: 'majority', wtimeout: 3000 } }
                )

                return resInsert.insertedId
            })

            if (result) {
                // PONTO CHAVE: Aplicando a lógica de retorno idêntica ao PedidoMudarStatus
                const usuarioCompradorId = String(_pedido[0].usuario_id)
                const usuarioVendedorId = String(_pedido[0].produtos[0].usuario_vendedor_id)

                let pedidos = null

                if (usuarioCompradorId === usuarioVendedorId) {
                    // Caso 1: Usuário compra dele mesmo (Comprador/Vendedor são o mesmo)
                    const pedidosCompradorVendedor = await fnPedidosEnviadosAceitos(usuarioCompradorId)
                    pedidos = { pedidosCompradorVendedor: pedidosCompradorVendedor }

                    // Broadcast para todos (incluindo o comprador/vendedor)
                    fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidos)
                } else {
                    // Caso 2: Transação normal (Comprador e Vendedor são diferentes)
                    const pedidosComprador = await fnPedidosEnviadosAceitos(usuarioCompradorId)
                    const pedidosVendedor = await fnPedidosEnviadosAceitos(usuarioVendedorId)

                    // Empacota os dados para ambos (Comprador e Vendedor) no mesmo payload
                    pedidos = { pedidosComprador: pedidosComprador, pedidosVendedor: pedidosVendedor }

                    // Broadcast para todos, garantindo que o Comprador receba sua lista e o Vendedor a dele.
                    fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidos)
                }
            }
        } else {
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ATT`)
        }
    } catch (error: any) {
        console.error('❌ Erro em PedidoNovo:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}