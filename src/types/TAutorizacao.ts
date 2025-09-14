//src/types/TAutorizacao.ts
export type TAutorizacao = {
    _id: string | null
    email_acesso: string | null
    codigo_acesso: string | null    
    email_verificado: boolean
    codigo_acesso_enviado: boolean
    codigo_acesso_verificado: boolean
    usuario_cadastro_completo: boolean
    numero_acessos: number | null
    expiracao: string | null    
    criado_em: Date | null
    atualizado_em: Date | null
}

// Valores default
export const autorizacaoValuesDefault: TAutorizacao = {
    _id: null,
    email_acesso: null,
    codigo_acesso: null,    
    email_verificado: false,
    codigo_acesso_enviado: false,
    codigo_acesso_verificado: false,
    usuario_cadastro_completo: false,
    numero_acessos: 0,
    expiracao: null,
    criado_em: new Date(),
    atualizado_em: new Date()
}
