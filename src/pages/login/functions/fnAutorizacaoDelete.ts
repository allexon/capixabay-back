//src/login/sockets/functions/fnAutorizacaoDelete.ts
import { fnConnectDirectCollection } from '@/db/capixabay-collections'

export const fnAutorizacaoDelete = async (email_acesso:string) => {
  const { AUTORIZACOES } = await fnConnectDirectCollection()

  try {
    const _res = await AUTORIZACOES.deleteOne({email_acesso:email_acesso}, { writeConcern: { w: 'majority', wtimeout: 3000 } })
    if (_res.acknowledged) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  } 
}