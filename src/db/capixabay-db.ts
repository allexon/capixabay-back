// src/db/capixabay-db.ts
import { MongoClient, Db, ReadConcern } from 'mongodb'
import { ENV } from '@/config/env-config' // Importa a configuração unificada

let _mongoClient: MongoClient | null = null
let _db: Db | null = null

/**
 * Conecta-se ao MongoDB usando as configurações unificadas do objeto ENV.
 */
export const fnConnectMongoDb = async (): Promise<{ client: MongoClient; db: Db }> => {
    // Se já existe uma conexão ativa, a reutiliza.
    if (_mongoClient && _db) {
        return { client: _mongoClient, db: _db }
    }

    // A partir daqui, o código não precisa mais saber qual é o ambiente (DEV, PROD, etc.).
    // Ele apenas consome as propriedades corretas do objeto ENV.
    console.log(`Ambiente DB: ${ENV.NODE_ENV}`)

    // 1. Valida se a URL do MongoDB existe no objeto ENV.
    if (!ENV.MONGO_DB_URL) {
        throw new Error('Variável de ambiente MONGO_DB_URL não está definida. Verifique o seu env-config.ts.')
    }

    // 2. Valida se o NOME do banco de dados existe no objeto ENV.
    if (!ENV.MONGO_DB_NAME) {
        throw new Error('Variável de ambiente MONGO_DB_NAME não está definida. Verifique o seu env-config.ts.')
    }

    // 3. Usa a propriedade MONGO_DB_URL diretamente do objeto ENV.
    _mongoClient = new MongoClient(ENV.MONGO_DB_URL, {
        serverSelectionTimeoutMS: 5000, // Aumentado para dar mais tempo em redes lentas
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
        readConcern: new ReadConcern('majority'),
        writeConcern: { w: 'majority', wtimeoutMS: 5000 },
        maxPoolSize: 10,
        minPoolSize: 2
    })

    try {
        await _mongoClient.connect()
        // 4. Usa a propriedade MONGO_DB_NAME diretamente do objeto ENV.
        _db = _mongoClient.db(ENV.MONGO_DB_NAME)
        console.log(`✅ Conexão com MongoDB (${ENV.MONGO_DB_NAME}) estabelecida com sucesso!`)
        return { client: _mongoClient, db: _db }
    } catch (err) {
        console.error('❌ Falha ao conectar ao MongoDB:', err)
        if (_mongoClient) {
            await _mongoClient.close().catch(e => console.error("Erro ao fechar cliente MongoDB:", e))
            _mongoClient = null
            _db = null
        }
        // Propaga o erro para que a função que chamou saiba que a conexão falhou.
        throw err
    }
}
