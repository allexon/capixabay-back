// src/db/capixabay-db.ts
import { MongoClient, Db, ReadConcern } from 'mongodb'
import { ENV } from '@/config/env-config'

let _mongoClient: MongoClient | null = null
let _db: Db | null = null

/**
 * Conecta-se ao MongoDB usando as configurações unificadas do objeto ENV.
 */
export const fnConnectMongoDb = async (): Promise<{ client: MongoClient; db: Db }> => {
    // Se já existe uma conexão ativa, a reutiliza.
    if (_mongoClient && _db) {
        console.log('🔄 Reutilizando conexão existente com MongoDB')
        return { client: _mongoClient, db: _db }
    }

    console.log(`Ambiente DB: ${ENV.NODE_ENV}`)

    // 1. Valida se a URL do MongoDB existe no objeto ENV.
    if (!ENV.MONGO_DB_URL) {
        throw new Error('Variável de ambiente MONGO_DB_URL não está definida. Verifique o seu env-config.ts.')
    }

    // 2. Valida se o NOME do banco de dados existe no objeto ENV.
    if (!ENV.MONGO_DB_NAME) {
        throw new Error('Variável de ambiente MONGO_DB_NAME não está definida. Verifique o seu env-config.ts.')
    }

    // Assegura que o certificado raiz é confiável e que a negociação de TLS está habilitada.
    // O driver já lida com o TLS para `mongodb+srv`.
    const clientOptions: any = {
        serverSelectionTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
        tls: true, // Adicionando 'tls' para negociação explícita
        tlsAllowInvalidCertificates: false, // não aceita certificado inválido
        readConcern: new ReadConcern('majority'),
        writeConcern: { w: 'majority', wtimeoutMS: 5000 },
        maxPoolSize: 10,
        minPoolSize: 2,
        family: 4,  // Força IPv4 (evita tentativas IPv6)
        autoSelectFamily: false
    }

    // 3. Usa a propriedade MONGO_DB_URL diretamente do objeto ENV.
    // Removendo o parametro verbose da URL para testar
    console.log(`🔗 Tentando conectar ao MongoDB: ${ENV.MONGO_DB_URL.replace(/:([^@]+)@/, ':****@')}`)
    _mongoClient = new MongoClient(ENV.MONGO_DB_URL, clientOptions)

    try {
        await _mongoClient.connect()
        _db = _mongoClient.db(ENV.MONGO_DB_NAME)
        console.log(`✅ Conexão com MongoDB (${ENV.MONGO_DB_NAME}) estabelecida com sucesso!`)
        return { client: _mongoClient, db: _db }
    } catch (err: any) {
        console.error('❌ ::: Falha ao conectar ao MongoDB ::::', {
            message: err.message,
            stack: err.stack,
            url: ENV.MONGO_DB_URL.replace(/:([^@]+)@/, ':****@')
        })
        if (_mongoClient) {
            await _mongoClient.close().catch(e => console.error("Erro ao fechar cliente MongoDB:", e))
            _mongoClient = null
            _db = null
        }
        // Propaga o erro para que a função que chamou saiba que a conexão falhou.
        throw err
    }
}