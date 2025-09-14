// src/types/TUsuario.ts
// Estrutura que reflete a coleção do MongoDB, mas com tipos compatíveis com o front-end.
export type TUsuario = {
    _id: string | null
    nome: string | null
    celular: string | null
    cep: string | null
    logradouro: string | null
    numero_endereco: string | null
    estado: string | null
    municipio: string | null
    bairro: string | null
    ponto_referencia: string | null
    tipo_endereco: 'CASA' | 'APARTAMENTO' | null
    edificio_nome: string | null
    andar: string | null
    apartamento_numero: string | null
    bloco: string | null
    empresa: string | null
    avatar: string | null
    autorizacao_id: string | null
    autorizacao_email_acesso: string | null
    bairro_slug: string | null
    criado_em: Date | null
    atualizado_em: Date | null
    contador_pedido: number
}

// valores default
export const usuarioValuesDefault: TUsuario = {
    _id: null,
    nome: null,
    celular: null,
    criado_em: null,
    atualizado_em: null,
    cep: null,

    logradouro: null,
    numero_endereco: null,
    estado: null,
    municipio: null,
    bairro: null,
    ponto_referencia: null,
    tipo_endereco: null,
    edificio_nome: null,
    andar: null,
    apartamento_numero: null,
    bloco: null,
    empresa: null,
    avatar: null,
    autorizacao_id: null,
    autorizacao_email_acesso: null,
    bairro_slug: null,
    contador_pedido: 0
}