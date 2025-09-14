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
                const usuarioId = String(_pedido[0].usuario_id)
                const usuarioCompradorId = _pedido[0].usuario_id || _pedido[0].produtos[0].usuario_comprador_id
                const usuarioVendedorId = _pedido[0].produtos[0].usuario_vendedor_id

                console.log(':::: 2 USUARIO ID ::::', usuarioId)
                
                if (result) {
                    const usuarioId = String(_pedido[0].usuario_id)
                    const usuarioCompradorId = String(_pedido[0].usuario_id) // O comprador original é sempre quem fez o pedido
                    const usuarioVendedorId = String(_pedido[0].produtos[0].usuario_vendedor_id)

                    // 1. Envia a resposta para o usuário que fez o pedido (o comprador)
                    const pedidosComprador = await fnPedidosEnviadosAceitos(usuarioId)
                    fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidosComprador)

                    // 2. Transmite a atualização para o vendedor, se ele for uma pessoa diferente
                    if (usuarioCompradorId !== usuarioVendedorId) {
                        const pedidosVendedor = await fnPedidosEnviadosAceitos(usuarioVendedorId)
                        fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, pedidosVendedor)
                    }
                }
            }
        } else {
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ATT`)
        }
    } catch (error: any) {
        console.error('❌ Erro em ioPedido:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}