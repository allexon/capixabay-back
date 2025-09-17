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

    // Usando a variável do objeto ENV para determinar o ambiente, para manter a consistência
    console.log(`Ambiente DB: ${ENV.IS_PROD ? 'Produção' : 'Desenvolvimento'}`)

    // Verificação de segurança: A URL deve existir. Isso evita o erro de `undefined`.
    if (!ENV.MONGO_URL) {
        throw new Error('Variável de ambiente MONGO_URL não está definida. Verifique o seu arquivo .env.')
    }

    _mongoClient = new MongoClient(ENV.MONGO_URL, {
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