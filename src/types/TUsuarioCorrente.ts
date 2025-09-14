// src/types/TUsuarioCorrente.ts

// --- No final vou ter dois modelos exportados para usar no respetivo store que envolva a coleção USUARIO ---
// TUsuarioCorrente -> Reflete tanto os tipos do back quanto do front
// usuarioCorrenteStates -> Reflete os valores default do back e front

// TUsuarioCorrenteBack, não precisa ser exportada porque já vai refletir internamente
// os tipos exatos da coleção USUARIOS do MongoDB, especificamente os campos que são mais usados.
export type TUsuarioCorrenteBack = {
    usuario_id: string
    usuario_nome: string | null
    usuario_email_acesso: string | null
    usuario_avatar: string | null
    usuario_cep: string | null
    usuario_logradouro: string | null
    usuario_numero_endereco: string | null
    usuario_bairro_slug: string | null
    usuario_bairro: string | null
    usuario_municipio: string | null
    usuario_estado: string | null
    usuario_ponto_referencia: string | null
    usuario_celular: string | null
    usuario_tipo_endereco: string | null
    usuario_apartamento_numero: string | null
    usuario_edificio_nome: string | null
    usuario_andar: string | null
    usuario_bloco: string | null
    usuario_contador_pedido: number
}

// usuarioValuesDefault -> reflete exato os valores default dos campos do back
export const usuarioValuesDefault: TUsuarioCorrenteBack = {
    usuario_id: '',
    usuario_nome: null,
    usuario_email_acesso: null,
    usuario_avatar: null,
    usuario_cep: null,
    usuario_logradouro: null,
    usuario_numero_endereco: null,
    usuario_bairro_slug: null,
    usuario_bairro: null,
    usuario_municipio: null,
    usuario_estado: null,
    usuario_ponto_referencia: null,
    usuario_celular: null,
    usuario_tipo_endereco: null,
    usuario_apartamento_numero: null,
    usuario_edificio_nome: null,
    usuario_andar: null,
    usuario_bloco: null,
    usuario_contador_pedido: 0
}

// TUsuarioCorrente -> vai sempre refletir a tipagem geral dos campos de back e front
export type TUsuarioCorrente = {
    status: boolean
    autorizacao: {
        autorizacao_id: string
        autorizacao_email_acesso: string | null
        autorizacao_numero_acesso: number | null
    }
    usuario: TUsuarioCorrenteBack
    empresa: {
        empresa_dono_id: string | null
        empresa_dono_nome: string | null
        empresa_id: string | null // Ajustado para aceitar null
        empresa_nome_fantasia: string | null
        empresa_categoria: string | null
        empresa_slug: string | null
        empresa_avatar: string | null
        empresa_aberta: boolean | null
        empresa_ativa: boolean | null
        empresa_whatsapp: string | null // Corrigido o nome do campo
        empresa_celular: string | null
        empresa_rota: string | null
    }
    empresasAtendemBairro: Array<{
        empresa_dono_id: string | null // Adicionado e ajustado
        empresa_dono_nome: string | null // Adicionado e ajustado
        empresa_id: string | null // Ajustado para aceitar null
        empresa_slug: string | null
        empresa_nome_fantasia: string | null
        empresa_ativa: boolean
        empresa_aberta: boolean
        categoria: any
    }>
}

// usuarioCorrenteStates -> reflete os valores default dos campos do back e front end
export const usuarioCorrenteStates: TUsuarioCorrente = {
    status: false,
    autorizacao: {
        autorizacao_id: '',
        autorizacao_email_acesso: null,
        autorizacao_numero_acesso: null,
    },
    usuario: { ...usuarioValuesDefault },
    empresa: {
        empresa_dono_id: null,
        empresa_dono_nome: null,
        empresa_id: null,
        empresa_nome_fantasia: null,
        empresa_categoria:null,
        empresa_slug: null,
        empresa_avatar: null,
        empresa_aberta: null,
        empresa_ativa: null,
        empresa_whatsapp: null,
        empresa_celular: null,
        empresa_rota: null,
    },
    empresasAtendemBairro: [],
}