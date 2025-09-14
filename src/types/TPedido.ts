// src/types/TPedido.ts
import { ObjectId } from 'mongodb'

export type TStatusPedido = 'ENVIADO' | 'ACEITO' | 'ENTREGUE' | 'CANCELADO' | 'FINALIZADO' | null
export type TStatusProduto = 'ENVIADO' | 'ACEITO' | 'ENTREGUE' | 'CANCELADO' | 'FINALIZADO' | null
export type TPagamento = 'PIX' | 'CARTAO' | 'DINHEIRO' | null

export type TEndereco = {
    cep: string | null
    logradouro: string | null
    numero_endereco: string | null
    estado: string | null
    municipio: string | null
    bairro: string | null
    ponto_referencia: string | null
    tipo_endereco: string | null
    edificio_nome: string | null
    andar: string | null
    apartamento_numero: string | null
    bloco: string | null
}

export type TProduto = {
    usuario_comprador_id: string | null
    usuario_comprador_nome: string | null
    usuario_vendedor_id: string
    usuario_vendedor_nome: string
    empresa_id: string | null
    empresa_slug: string | null
    empresa_nome_fantasia: string | null
    empresa_categoria: string | null
    empresa_whatsapp: string | null
    empresa_celular: string | null    
    produto_slug: string | null
    produto_categoria: string | null
    produto_descricao: string | null
    produto_qtde: number
    produto_preco_base: number
    produto_preco_venda: number
    produto_subtotal: number
    produto_status: TStatusProduto
}

export type TPedido = {    
    _id: ObjectId | null   // 👈 permite usar null como default
    status: TStatusPedido | null    
    empresa_categoria: string | null
    empresa_whatsapp: string | null
    empresa_celular: string | null
    autorizacao_id: string | null
    autorizacao_email_acesso: string | null
    usuario_id: string | null
    usuario_nome: string | null
    usuario_celular: string | null
    usuario_endereco: TEndereco[]
    produtos: TProduto[]
    pagamento: TPagamento
    total_geral: number   
    comissao: number
    comissao_valor: number
    criado_em: Date | null
    atualizado_em: Date | null
    tempo_enviado_minutos: number
    tempo_aceito_minutos: number
    tempo_max_espera_enviado: number
    tempo_max_espera_aceito: number
    contador_pedido: number

}

// valores default
export const pedidoStates = {    
    _id: null,
    status: null,    
    empresa_categoria: null,
    empresa_whatsapp: null,
    empresa_celular: null,
    autorizacao_id: null,
    autorizacao_email_acesso: null,
    usuario_id: null,
    usuario_nome: null,
    usuario_celular: null, 
    usuario_endereco: [],
    produtos: [],
    pagamento: null,
    total_geral: 0,
    comissao: 0,
    comissao_valor: 0,
    criado_em: null,
    atualizado_em: new Date(),
    tempo_enviado_minutos: 0,
    tempo_aceito_minutos: 0,
    tempo_max_espera_enviado: 3,
    tempo_max_espera_aceito: 5,
    contador_pedido: 0
}