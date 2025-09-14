/*
    TPedidoFinal -> Terá com base um determinado período de calculo para data_inicial, data_final, e não precisa
    ter mais a coleção completa de pedidos. Geralmente o TPedidoFinal o status do pedido vai estar CANCELADO ou ENTREGUE
*/

export type TStatus = 'CANCELADOS' | 'ENTREGUE'

// --- Estrutura de cada produto contabilizado ---
type TSubtotal = {
    produto: string
    pedido_qtde: number,  
    pedido_cancelados: number, 
    pedido_qtde_efetiva: number, 
    valor_venda: number,
    valor_comissao: number,
    subtotal_venda: number,
    subtotal_comissao: number,
    empresa_slug: string
    empresa_id: string
}

export type TTotal = {    
    qtde: number,
    total: number    
    total_comissao?: number    // só tem em venda
}

// Novos tipos para a estrutura de objeto de subtotais e totais
type TResumoSubtotais = {
    compras: TSubtotal[]
    vendas: TSubtotal[]
}

type TResumoTotais = {
    compras: TTotal
    vendas: TTotal
}

export type TPedidoFinal = {
    usuario_id: string
    empresa_slug: string | null
    empresa_id: string | null
    data_inicial: Date | null
    data_final: Date | null
    subtotais: TResumoSubtotais
    totais: TResumoTotais
}

//  TPedidoFinal -> Exemplo Modelo resumido
/*
    {
        usuario_id: '6856d8c90e853861a9947ff7',
        data_inicial: '2025-09-06T14:09:42.572Z'
        data_final: '2025-09-06T14:09:42.572Z'
        empresa_slug:'ZEDOGAS',    
        empresa_id: '685552e4d4af0e0b63a238fa',        
        subtotais: {
            compras: [{...array_subtotal_compras...}],
            vendas: [{...array_subtotal_vendas...}],
        },
        totais: {
            compras: {...objeto_total_compras...},
            vendas: {...objeto_total_vendas...},
        }
    }
*/

/*************************** TOTAL TTotal ***************************/
/* --- OBJETO TOTAL DE  COMPRAS ----
        {
            qtde: 24, 
            total: 569,56
        }

    --- OBJETO TOTAL DE VENDAS ---
        {
            qtde: 12, 
            total: 284.78, 
            total_comissao: 14.24
        }
*/

/*************************** SUBTOTAL TSubtotal ***************************/
/*
    --- ARRAY DOS OBJETOS DE COMPRAS (subtotais)
        [
            {
                produto:'GAS',  
                pedido_qtde: 3,  
                pedido_cancelados: 1, 
                pedido_qtde_efetiva: 2,  
                valor_venda:   99.89, ( o valor e sempre registrar na notação DOLAR, mas exbido na notação REAL)                       
                subtotal_venda: 199.78
                valor_comissao: 0.05 (5% por cento)
                subtotal_comissao: 9.9989 (arredondo para 9.99)                        
            },
            {
                produto:'AGUA', 
                enviado: 10, 
                cancelados:0, 
                qtde_efetiva: 10, 
                valor_venda: 8.50                        
                subtotal_venda: 85.00
                valor_comissao: 0.05 (5% por cento)
                subtotal_comissao: 4.25                        
            },
            {
                produto:'GAS',  
                pedido_qtde: 3,  
                pedido_cancelados: 1, 
                pedido_qtde_efetiva: 2,  
                valor_venda:   99.89, ( o valor e sempre registrar na notação DOLAR, mas exbido na notação REAL)                        
                subtotal_venda: 199.78
                valor_comissao: 0.05 (5% por cento)
                subtotal_comissao: 9.9989 (arredondo para 9.99)                        
            },
            {
                produto:'AGUA', 
                enviado: 10, 
                cancelados:0, 
                qtde_efetiva: 10, 
                valor_venda: 8.50                        
                subtotal_venda: 85.00
                valor_comissao: 0.05 (5% por cento)
                subtotal_comissao: 4.25                        
            }
        ]


    --- ARRAY DOS OBJETOS DE VENDAS (subtotais)

        [
            {
                produto:'GAS',  
                pedido_qtde: 3,  
                pedido_cancelados: 1, 
                pedido_qtde_efetiva: 2,  
                valor_venda:   99.89, ( o valor e sempre registrar na notação DOLAR, mas exbido na notação REAL)                
                valor_comissao: 0.05 (5% por cento)
                subtotal_venda: 199.78
                subtotal_comissao: 9.9989 (arredondo para 9.99)                   
            },
            {
                produto:'AGUA', 
                enviado: 10, 
                cancelados:0, 
                qtde_efetiva: 10, 
                valor_venda: 8.50
                valor_comissao: 0.05 (5% por cento)
                subtotal_venda: 85.00
                subtotal_comissao: 4.25                   
            },            
        ]

*/
