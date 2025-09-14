//src/pages/pedido/functions/fnPedidosEnviadosAceitos.ts
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { ReadConcern, ReadPreference } from 'mongodb'
import { pedidosEnviadosAceitosStates, type TPedidosEnviadosAceitos } from '@/pages/pedido/types/TPedidosEnviadosAceitos'

export const fnPedidosEnviadosAceitos = async (usuario_id: string): Promise<TPedidosEnviadosAceitos> => {
    const { PEDIDOS } = await fnConnectDirectCollection()
    const replicaSetParams = {
        readConcern: new ReadConcern('majority'),
        readPreference: ReadPreference.primaryPreferred
    }

    const pedidos = await PEDIDOS.find({
        $or: [
            { 'produtos.usuario_comprador_id': usuario_id },
            { 'produtos.usuario_vendedor_id': usuario_id },
        ],
    }, replicaSetParams).toArray()

    const result: TPedidosEnviadosAceitos = { ...pedidosEnviadosAceitosStates, usuario_id }

    if (pedidos.length > 0) {
        const primeiroPedido = pedidos[0]
        const primeiroProd = primeiroPedido.produtos[0]

        let nomeUsuario: string | null = null
        const usuarioIdPedido = primeiroPedido.usuario_id ? primeiroPedido.usuario_id.toString() : null
        if (primeiroProd.usuario_vendedor_id === usuario_id && primeiroProd.usuario_vendedor_id !== usuarioIdPedido) {
            nomeUsuario = primeiroProd.usuario_vendedor_nome ?? null
        } else {
            nomeUsuario = primeiroPedido.usuario_nome ?? null
        }
        result.usuario_nome = nomeUsuario
    }

    const agora = new Date()
    const pedidosAtualizados: any[] = []

    pedidos.forEach((pedido: any) => {
        if (!pedido.produtos || pedido.produtos.length === 0) return

        const prod = pedido.produtos[0]
        const criadoEm = new Date(pedido.criado_em)
        const tempoEnviadoMinutos = Math.max(0, Math.floor((agora.getTime() - criadoEm.getTime()) / (1000 * 60)))
        let tempoAceitoMinutos = 0

        if (prod.produto_status === 'ACEITO' && pedido.atualizado_em) {
            const aceitoEm = new Date(pedido.atualizado_em)
            tempoAceitoMinutos = Math.max(0, Math.floor((agora.getTime() - aceitoEm.getTime()) / (1000 * 60)))
        }

        const pedidoAtualizado = {
            ...pedido,
            tempo_enviado_minutos: tempoEnviadoMinutos,
            tempo_aceito_minutos: tempoAceitoMinutos,
            tempo_max_espera_enviado: 5,
            tempo_max_espera_aceito: 3,
        }

        pedidosAtualizados.push(pedidoAtualizado)
        
        // --- INÍCIO DA LÓGICA CORRIGIDA DE TOTALIZAÇÃO ---
        const isComprador = prod.usuario_comprador_id === usuario_id
        const isVendedor = prod.usuario_vendedor_id === usuario_id
        
        if (prod.produto_status === 'ENVIADO' || prod.produto_status === 'ACEITO') {
            if (isComprador && isVendedor) {
                // Cenário de autocompra (compra e venda)
                result.total_pedidos_qtde++
                result.total_compras_qtde++
                result.total_vendas_qtde++
                if (prod.produto_status === 'ENVIADO') {
                    result.total_compras_enviados_qtde++
                    result.total_vendas_enviados_qtde++
                }
                if (prod.produto_status === 'ACEITO') result.total_compras_aceitos_qtde++

            } else if (isComprador) {
                // Cenário de apenas compra
                result.total_pedidos_qtde++
                result.total_compras_qtde++
                if (prod.produto_status === 'ENVIADO') result.total_compras_enviados_qtde++
                if (prod.produto_status === 'ACEITO') result.total_compras_aceitos_qtde++

            } else if (isVendedor) {
                // Cenário de apenas venda (contamos apenas ENVIADO)
                result.total_pedidos_qtde++
                result.total_vendas_qtde++
                result.total_vendas_enviados_qtde++
            }
        }
        // --- FIM DA LÓGICA CORRIGIDA DE TOTALIZAÇÃO ---
    })
    
    result.pedidos = pedidosAtualizados
    return result
}