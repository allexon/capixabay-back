// src/db/capixabay-collections.ts
import { Collection, Db } from 'mongodb'
import { fnConnectMongoDb } from '@/db/capixabay-db'

// TYPES
import { TAutorizacao } from '@/types/TAutorizacao'
import { TUsuario } from '@/types/TUsuario'
import { TEmpresa } from '@/types/TEmpresa'
import { TPedido } from '@/types/TPedido'
import { TProduto } from '@/types/TProduto'
import type { TMenuPrincipal } from '@/types/TMenuPrincipal'
import type { TRota } from '@/types/TRota'

export enum Enun {
    AUTORIZACOES = 'AUTORIZACOES',
    USUARIOS = 'USUARIOS',
    EMPRESAS = 'EMPRESAS',
    ROTAS = 'ROTAS',
    PRODUTOS = 'PRODUTOS',
    PEDIDOS = 'PEDIDOS',
    MENU_PRINCIPAL = 'MENU_PRINCIPAL'
}

type Types = {
    [Enun.AUTORIZACOES]: TAutorizacao
    [Enun.USUARIOS]: TUsuario
    [Enun.EMPRESAS]: TEmpresa
    [Enun.ROTAS]: TRota
    [Enun.PRODUTOS]: TProduto
    [Enun.PEDIDOS]: TPedido    
    [Enun.MENU_PRINCIPAL]: TMenuPrincipal
}

let collections = {} as { [K in Enun]: Collection<Types[K]> }

// Inicializa as coleções no escopo global
export const fnStartColletions = (db: Db): void => {
    collections[Enun.AUTORIZACOES] = db.collection(Enun.AUTORIZACOES)
    collections[Enun.USUARIOS] = db.collection(Enun.USUARIOS)
    collections[Enun.EMPRESAS] = db.collection(Enun.EMPRESAS)    
    collections[Enun.ROTAS] = db.collection(Enun.ROTAS)    
    collections[Enun.PRODUTOS] = db.collection(Enun.PRODUTOS)
    collections[Enun.PEDIDOS] = db.collection(Enun.PEDIDOS)    
    collections[Enun.MENU_PRINCIPAL] = db.collection(Enun.MENU_PRINCIPAL)
}

// Retorna as coleções diretamente de um Db fornecido
export const fnGetCollectionsFromDb = (db: Db): { [K in Enun]: Collection<Types[K]> } => ({
    [Enun.AUTORIZACOES]: db.collection(Enun.AUTORIZACOES),
    [Enun.USUARIOS]: db.collection(Enun.USUARIOS),
    [Enun.EMPRESAS]: db.collection(Enun.EMPRESAS),    
    [Enun.ROTAS]: db.collection(Enun.ROTAS),    
    [Enun.PRODUTOS]: db.collection(Enun.PRODUTOS),
    [Enun.PEDIDOS]: db.collection(Enun.PEDIDOS),    
    [Enun.MENU_PRINCIPAL]: db.collection(Enun.MENU_PRINCIPAL)
})

// Retorna coleções do escopo global (já inicializadas por fnStartCollections)
export const fnGetCollections = (db?: Db): { [K in Enun]: Collection<Types[K]> } => {
    if (db) return fnGetCollectionsFromDb(db)
    if (
        !collections[Enun.USUARIOS] ||
        !collections[Enun.AUTORIZACOES] ||
        !collections[Enun.EMPRESAS] ||        
        !collections[Enun.ROTAS] ||        
        !collections[Enun.PRODUTOS] ||
        !collections[Enun.PEDIDOS] ||        
        !collections[Enun.MENU_PRINCIPAL]
    ) {
        throw new Error('Coleções globais não inicializadas.')
    }
    return collections
}

// Conecta ao banco e inicializa as coleções globais (para uso com fnGetCollections)
export const fnConnectAndInitCollections = async (): Promise<void> => {
    const { db } = await fnConnectMongoDb()
    fnStartColletions(db)
}

// [ALTERAÇÃO]: Adiciona verificação e log para garantir conexão
export const fnConnectDirectCollection = async (): Promise<{ [K in Enun]: Collection<Types[K]> }> => {
    console.log('🔄 Iniciando fnConnectDirectCollection...')
    const { db } = await fnConnectMongoDb()
    if (!db) {
        console.error('❌ Banco de dados não conectado em fnConnectDirectCollection')
        throw new Error('Banco de dados não conectado.')
    }
    console.log('✅ Banco de dados conectado, retornando coleções.')
    return fnGetCollectionsFromDb(db)
}