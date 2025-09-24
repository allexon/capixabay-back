// src/db/fnSessaoAtomica.ts
import { Db, ClientSession } from 'mongodb'
import { fnConnectMongoDb } from '@/db/capixabay-db'

/**
 * Executa um bloco dentro de uma transação MongoDB
 * Garante rollback em caso de erro
 */
export const fnSessaoAtomica = async <T>(exec: (db: Db, session: ClientSession) => Promise<T>): Promise<T> => {
  console.log('🔄 Iniciando fnSessaoAtomica')
  const { client, db } = await fnConnectMongoDb()
  const session = client.startSession()

  try {
    let result: T
    await session.withTransaction(
      async () => {
        result = await exec(db, session)
      },
      {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      }
    )
    console.log('✅ Sessão atômica concluída com sucesso')
    return result!
  } catch (err: any) {
    console.error('❌ Erro em fnSessaoAtomica:', {
      message: err.message,
      stack: err.stack,
    })
    throw err
  } finally {
    await session.endSession()
  }
}


/*
import { Db, ClientSession } from 'mongodb'
import { fnConnectMongoDb } from '@/db/capixabay-db'

export const fnSessaoAtomica = async <T>(exec: (db: Db, session: ClientSession) => Promise<T>): Promise<T> => {
    // [ALTERAÇÃO]: Log para confirmar início da sessão
    console.log('🔄 Iniciando fnSessaoAtomica')
    const { client, db } = await fnConnectMongoDb()
    const session = client.startSession()

    try {
        let result: T
        await session.withTransaction(async () => {
            result = await exec(db, session)
        }, {
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority' },
            readPreference: 'primary'
        })
        console.log('✅ Sessão atômica concluída com sucesso')
        return result!
    } catch (err: any) {
        // [ALTERAÇÃO]: Log detalhado do erro
        console.error('❌ Erro em fnSessaoAtomica:', {
            message: err.message,
            stack: err.stack
        })
        throw err
    } finally {
        await session.endSession()
    }
}

*/