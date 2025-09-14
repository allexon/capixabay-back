// src/types/TEmpresa.ts
import { ObjectId } from 'mongodb'

export type TEnderecoEmpresa = {
    logradouro: string | null
    numero: string | null
    bairro: string | null
    cidade: string | null
    estado: string | null
    cep: string | null
}

export type TEmpresa = {
    _id: ObjectId | null   // 👈 permite usar null como default
    dono_id: string | null
    dono_nome: string | null
    cnpj: string | null
    url_completa: string | null
    nome_fiscal: string | null
    nome_fantasia: string | null    
    slug: string | null
    chaves_pix: string[]
    categoria: string | null
    endereco: TEnderecoEmpresa
    ativa: boolean
    aberta: boolean
    logo_url: string | null
    avatar: string | null
    autorizacao_id: string | null
    autorizacao_email_acesso: string | null
    rota_slug: string | null    
    whatsapp: string | null
    celular: string | null
    criado_em: Date | null
    atualizado_em: Date | null
}

// valores default
export const empresaValuesDefault: TEmpresa = {
    _id: null,   // ✅ agora funciona
    dono_id: null,
    dono_nome: null,
    cnpj: null,
    url_completa: null,
    nome_fiscal: null,
    nome_fantasia: null,
    slug: null,
    chaves_pix: [],
    categoria: null,
    endereco: {
        logradouro: null,
        numero: null,
        bairro: null,
        cidade: null,
        estado: null,
        cep: null,
    },
    ativa: false,
    aberta: false,
    logo_url: null,
    avatar: null,
    autorizacao_id: null,
    autorizacao_email_acesso: null,
    rota_slug: null,    
    whatsapp: null,
    celular: null,
    criado_em: new Date(),
    atualizado_em: new Date()
}
