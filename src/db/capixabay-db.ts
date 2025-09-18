// src/db/capixabay-db.ts
import { MongoClient, Db, ReadConcern } from 'mongodb'
import { ENV } from '@/config/env-config'

let _mongoClient: MongoClient | null = null
let _db: Db | null = null

/**
 * Conecta-se ao MongoDB usando as configurações unificadas
 */
export const fnConnectMongoDb = async (): Promise<{ client: MongoClient; db: Db }> => {
    if (_mongoClient && _db) {
        return { client: _mongoClient, db: _db }
    }

    // ✅ Correção: Use ENV.NODE_ENV para determinar o ambiente
    console.log(`Ambiente DB: ${ENV.NODE_ENV === 'PROD' ? 'Produção' : 'Desenvolvimento'}`)

    // ✅ Correção: A propriedade correta é MONGODB_URL
    if (!ENV.MONGO_DB_URL) {
        throw new Error('Variável de ambiente MONGODB_URL não está definida. Verifique o seu arquivo .env.')
    }

    // ✅ Correção: A propriedade correta é MONGODB_URL
    _mongoClient = new MongoClient(ENV.MONGO_DB_URL, {
        serverSelectionTimeoutMS: 1000,
        heartbeatFrequencyMS: 1000,
        retryWrites: true,
        retryReads: true,
        readConcern: new ReadConcern('majority'),
        writeConcern: { w: 'majority', wtimeoutMS: 5000 },
        maxPoolSize: 10,
        minPoolSize: 2
    })

    try {
        await _mongoClient.connect()
        _db = _mongoClient.db(ENV.MONGO_DB_NAME)
        console.log('✅ Conexão com MongoDB estabelecida com sucesso!')
        return { client: _mongoClient, db: _db }
    } catch (err) {
        console.error('❌ Falha ao conectar ao MongoDB:', err)
        if (_mongoClient) {
            await _mongoClient.close().catch(e => console.error("Erro ao fechar cliente MongoDB:", e))
            _mongoClient = null
            _db = null
        }
        throw err
    }
}