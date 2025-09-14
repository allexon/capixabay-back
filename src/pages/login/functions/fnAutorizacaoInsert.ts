//src/login/sockets/functions/fnAutorizacaoInsert.ts
import { ObjectId } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { TAutorizacao, autorizacaoValuesDefault } from '@/types/TAutorizacao'

export const fnAutorizacaoInsert = async (email_acesso: string | null) => {
  const { AUTORIZACOES } = await fnConnectDirectCollection()

  const fnGerarCodigoAcesso = () => Math.floor(100000 + Math.random() * 900000).toString()

  const _data: TAutorizacao = {
    ...autorizacaoValuesDefault,          // valores default
    _id: new ObjectId().toHexString(),    // string compatível front/back
    email_acesso: email_acesso,   
    codigo_acesso: fnGerarCodigoAcesso(),
    criado_em: new Date(),                // Date correto
    atualizado_em: new Date()             // Date correto
  }

  try {
    const _res = await AUTORIZACOES.insertOne(_data, { writeConcern: { w: 'majority', wtimeout: 3000 } })

    if (_res.acknowledged) {
      return { status: true, data: _data }
    } else {
      return { status: false, data: _data }
    }
  } catch (error) {
    console.error('Erro ao inserir autorização:', error)
    return { status: false, data: _data }
  }
}
