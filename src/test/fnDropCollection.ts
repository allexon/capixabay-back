// src/test-codigo/fnResetCapixabayDB.ts
import { MongoClient } from 'mongodb'

export const fnDropCollection = async (collectionName: string) => {
  const client = new MongoClient("mongodb://localhost:27017,localhost:27018,localhost:27019/CAPIXABAY_DB?replicaSet=rs0")
  try {
    await client.connect()
    const db = client.db('CAPIXABAY_DB')
    
    // Verifica se a coleção existe
    const collections = await db.listCollections().toArray()
    if (!collections.find(c => c.name === collectionName)) {
      console.log(`Coleção ${collectionName} não encontrada no banco CAPIXABAY_DB`)
      return
    }
    
    // Dropa a coleção específica
    await db.collection(collectionName).drop()
    console.log(`Coleção ${collectionName} dropada com sucesso`)
  } catch (error) {
    console.error(`Erro ao dropar a coleção ${collectionName}:`, error)
    throw error
  } finally {
    await client.close()
  }
}
fnDropCollection('PEDIDOS')