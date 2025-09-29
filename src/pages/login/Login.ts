//src/sockets/login/Login.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { ReadConcern, ReadPreference } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnEnviarEmail } from '@/pages/login/functions/fnEnviarEmail'
import { fnAutorizacaoUpdate } from '@/pages/login/functions/fnAutorizacaoUpdate'
import { fnAutorizacaoInsert } from '@/pages/login/functions/fnAutorizacaoInsert'
import { fnAutorizacaoDelete } from '@/pages/login/functions/fnAutorizacaoDelete'

type TRequire = {
    canal: string
    data: { [key: string]: any }
}

// 🚀 FUNÇÃO PRINCIPAL
export const Login = async (req: TRequire, socket: Socket) => {

    const { AUTORIZACOES } = await fnConnectDirectCollection()
    const _replicaSetParams = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }

    const data = req.data || req // tenta pegar do data, senão usa o req direto

    if (!data || !req) {
        fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-REQ-INVALIDA')
        return
    }

    const req_email_acesso = data.email_acesso
    const req_codigo_acesso = data.codigo_acesso

    try {
        // SEMPRE COMEÇA A PROCURA PELO EMAIL DE ACESSO
        const resAutorizacao = await AUTORIZACOES.findOne({ email_acesso: req_email_acesso }, _replicaSetParams)

        if (resAutorizacao) {
            // SE EMAIL ACESSO EXISTIR → compara código de acesso            
            if (req_codigo_acesso && req_codigo_acesso.trim() && req_codigo_acesso === resAutorizacao.codigo_acesso) {                
                // EMAIL E CODIGO DE ACESSO JA EXISTEM
                let res = await fnAutorizacaoUpdate(resAutorizacao, 'CODIGO-ACESSO-ATUAL')                
                fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-ACESSO-PERMITIDO', res.data)
            } else {                
                // EMAIL EXISTE, MAS NÃO TEM UM CODIGO DE ACESSO VALIDO                
                const resAutorizacaoUpdate = await fnAutorizacaoUpdate(resAutorizacao, 'NOVO-CODIGO-ACESSO')

                if (!resAutorizacaoUpdate.status || !resAutorizacaoUpdate.data) {
                    fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-UPDATE-FALHOU')
                    return
                }

                const novoCodigo = resAutorizacaoUpdate.data.codigo_acesso
                const resEnvioEmail = await fnEnviarEmail({ email_acesso: req_email_acesso, codigo_acesso: novoCodigo })

                if (resEnvioEmail) {                    
                    const data = { ...resAutorizacaoUpdate.data, codigo_acesso: null } // não envia código real para front                    
                    fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-INFORME-CODIGO-ACESSO', data)
                } else {                    
                    fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-CODIGO-ACESSO-INVALIDO')
                }
            }
        } else { 
            // NOVO USUAIO
            const resInsert = await fnAutorizacaoInsert(req_email_acesso)

            if (!resInsert.status || !resInsert.data) {
                fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-TENTAR-NOVAMENTE', resInsert.data)
                return
            }

            const resEnvioEmail = await fnEnviarEmail({ email_acesso: req_email_acesso, codigo_acesso: resInsert.data.codigo_acesso })

            if (resEnvioEmail) {
                let data = { ...resInsert.data, codigo_acesso: null } // o código é enviado como null, porque, porque o mesmo é enviado no email
                fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-INFORME-CODIGO-ACESSO-NOVO-USUARIO', data)
            } else {
                await fnAutorizacaoDelete(req_email_acesso)
                fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-TENTAR-NOVAMENTE', resInsert.data)
            }
        }
    } catch (error) {
        fnRespostaIO(socket, IO.AUTORIZACAO, 'AUTORIZACAO-ERROR', error)
    }
}
