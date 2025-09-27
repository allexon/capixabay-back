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

// ENUM com nomes fixos das coleções
export enum Enun {
    AUTORIZACOES = 'AUTORIZACOES',
    USUARIOS = 'USUARIOS',
    EMPRESAS = 'EMPRESAS',
    ROTAS = 'ROTAS',
    PRODUTOS = 'PRODUTOS',
    PEDIDOS = 'PEDIDOS',
    MENU_PRINCIPAL = 'MENU_PRINCIPAL'
}

// Tipagem associando cada coleção ao seu tipo
type Types = {
    [Enun.AUTORIZACOES]: TAutorizacao
    [Enun.USUARIOS]: TUsuario
    [Enun.EMPRESAS]: TEmpresa
    [Enun.ROTAS]: TRota
    [Enun.PRODUTOS]: TProduto
    [Enun.PEDIDOS]: TPedido
    [Enun.MENU_PRINCIPAL]: TMenuPrincipal    
}

// Coleções globais (opcional para reuso)
let collections: { [K in Enun]?: Collection<Types[K]> } = {}

// Inicializa coleções globais
export const fnStartCollections = (db: Db): void => {
    collections = {
        [Enun.AUTORIZACOES]: db.collection(Enun.AUTORIZACOES),
        [Enun.USUARIOS]: db.collection(Enun.USUARIOS),
        [Enun.EMPRESAS]: db.collection(Enun.EMPRESAS),
        [Enun.ROTAS]: db.collection(Enun.ROTAS),
        [Enun.PRODUTOS]: db.collection(Enun.PRODUTOS),
        [Enun.PEDIDOS]: db.collection(Enun.PEDIDOS),
        [Enun.MENU_PRINCIPAL]: db.collection(Enun.MENU_PRINCIPAL)        
    }
}

// Retorna coleções de um Db direto (sem mexer no global)
export const fnGetCollectionsFromDb = (db: Db): { [K in Enun]: Collection<Types[K]> } => ({
    [Enun.AUTORIZACOES]: db.collection(Enun.AUTORIZACOES),
    [Enun.USUARIOS]: db.collection(Enun.USUARIOS),
    [Enun.EMPRESAS]: db.collection(Enun.EMPRESAS),
    [Enun.ROTAS]: db.collection(Enun.ROTAS),
    [Enun.PRODUTOS]: db.collection(Enun.PRODUTOS),
    [Enun.PEDIDOS]: db.collection(Enun.PEDIDOS),
    [Enun.MENU_PRINCIPAL]: db.collection(Enun.MENU_PRINCIPAL)    
})

// Retorna coleções globais já inicializadas
export const fnGetCollections = (): { [K in Enun]: Collection<Types[K]> } => {
    if (
        !collections[Enun.USUARIOS] ||
        !collections[Enun.AUTORIZACOES] ||
        !collections[Enun.EMPRESAS] ||
        !collections[Enun.ROTAS] ||
        !collections[Enun.PRODUTOS] ||
        !collections[Enun.PEDIDOS] ||
        !collections[Enun.MENU_PRINCIPAL]        
    ) {
        throw new Error('❌ Coleções globais não inicializadas. Use fnConnectAndInitCollections primeiro.')
    }
    return collections as { [K in Enun]: Collection<Types[K]> }
}

// Conecta ao banco e inicializa as coleções globais
export const fnConnectAndInitCollections = async (): Promise<void> => {
    const { db } = await fnConnectMongoDb()
    fnStartCollections(db)
}

// Conecta e retorna coleções sem usar globais
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