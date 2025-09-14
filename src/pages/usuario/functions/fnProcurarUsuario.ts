//src/sockets/usuario/functions/fnProcurarUsuario.ts
import { fnConnectDirectCollection } from '@/db/capixabay-collections'

export const fnProcurarUsuario = async (autorizacao_id: string) => {
    const { USUARIOS } = await fnConnectDirectCollection()
    return await USUARIOS.findOne({ autorizacao_id }) // somente string
}