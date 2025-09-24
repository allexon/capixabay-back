// src/db/capixabay-db.ts
import { MongoClient, Db, ReadConcern } from 'mongodb'
import { ENV } from '@/config/env-config'

let _mongoClient: MongoClient | null = null
let _db: Db | null = null

export const fnConnectMongoDb = async (): Promise<{ client: MongoClient; db: Db }> => {
    if (_mongoClient && _db) {
        console.log('🔄 Reutilizando conexão existente com MongoDB')
        return { client: _mongoClient, db: _db }
    }

    console.log(`Ambiente DB: ${ENV.NODE_ENV}`)

    if (!ENV.MONGO_DB_URL) {
        throw new Error('Variável de ambiente MONGO_DB_URL não está definida.')
    }
    if (!ENV.MONGO_DB_NAME) {
        throw new Error('Variável de ambiente MONGO_DB_NAME não está definida.')
    }

    // Configurações diferentes para PROD e DEV
    const clientOptions: any =
        ENV.NODE_ENV === 'PROD'
            ? {
                serverSelectionTimeoutMS: 30000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                retryReads: true,
                tls: true,
                tlsAllowInvalidCertificates: false,
                readConcern: new ReadConcern('majority'),
                writeConcern: { w: 'majority', wtimeoutMS: 5000 },
                maxPoolSize: 10,
                minPoolSize: 2,
                family: 4,
                autoSelectFamily: false,
            }
            : {
                serverSelectionTimeoutMS: 30000,
                retryWrites: true,
                retryReads: true,
                readConcern: new ReadConcern('majority'),
                writeConcern: { w: 'majority' },
                maxPoolSize: 5,
            }

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
            url: ENV.MONGO_DB_URL.replace(/:([^@]+)@/, ':****@'),
        })
        if (_mongoClient) {
            await _mongoClient.close().catch(e => console.error("Erro ao fechar cliente MongoDB:", e))
            _mongoClient = null
            _db = null
        }
        throw err
    }
}