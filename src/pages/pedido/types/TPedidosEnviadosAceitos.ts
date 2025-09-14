import type { TPedido } from '@/types/TPedido'

export type TStatus = 'ENVIADO' | 'ACEITO'

// Modelo principal simplificado de transição do pedido
export type TPedidosEnviadosAceitos = {
    usuario_id: string | null
    usuario_nome: string | null
    total_pedidos_qtde: number
    total_compras_qtde: number
    total_vendas_qtde: number    
    total_compras_enviados_qtde: number
    total_compras_aceitos_qtde: number
    total_vendas_enviados_qtde: number
    total_vendas_aceitos_qtde: number
    pedidos: TPedido[]  // Novo: Array único de todos os pedidos relacionados (com tempos calculados)
}

// Valores default para o modelo principal de transição
export const pedidosEnviadosAceitosStates: TPedidosEnviadosAceitos = {
    usuario_id: null,
    usuario_nome: null,
    total_pedidos_qtde: 0,
    total_compras_qtde: 0,
    total_vendas_qtde: 0,
    total_compras_enviados_qtde: 0,
    total_compras_aceitos_qtde: 0,
    total_vendas_enviados_qtde: 0,
    total_vendas_aceitos_qtde: 0,
    pedidos: [],
}