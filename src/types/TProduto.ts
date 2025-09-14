//src/types/TProduto.ts

//Tipo principal do produto
export type TProduto = {
    _id: string | null    
    usuario_id: string | null
    empresa_id: string | null
    empresa_dono: string | null
    empresa_nome_fantasia: string | null
    empresa_slug: string | null
    empresa_avatar: string | null
    empresa_categoria: string | null
    empresa_whatsapp: string | null
    empresa_celular: string | null
    produto_categoria: string | null
    produto_descricao: string | null
    produto_preco_base: number
}

//Valores default do produto (para retornar quando não houver empresas abertas)
export const produtoValues: TProduto = {
    _id: null,
    usuario_id: null,
    empresa_id: null,
    empresa_dono: null,
    empresa_nome_fantasia: null,
    empresa_slug: null,
    empresa_avatar: null,
    empresa_categoria: null,
    empresa_whatsapp: null,
    empresa_celular: null,
    produto_categoria: null,
    produto_descricao: null,
    produto_preco_base: 0
}
