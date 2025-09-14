// src/db/fnSessaoAtomica.ts
import { Db, ClientSession } from 'mongodb'
import { fnConnectMongoDb } from '@/db/capixabay-db'

export const fnSessaoAtomica = async <T>(exec: (db: Db, session: ClientSession) => Promise<T>): Promise<T> => {
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
    return result!
  } finally {
    await session.endSession()
  }
}