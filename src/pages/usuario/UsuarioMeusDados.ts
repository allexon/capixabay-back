//src/sockets/usuario/UsuarioMeusDados.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { TUsuario } from '@/types/TUsuario'
import { ReadConcern, ReadPreference } from 'mongodb'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'

export const UsuarioMeusDados = async (req: { autorizacao_id: string | null }, socket: Socket) => {
  const autorizacaoId = req.autorizacao_id

  // Validação da requisição
  if (!autorizacaoId) {
    fnRespostaIO(socket, IO.USUARIO_MEUS_DADOS, 'U-ERROR-REQ', 'ID não informado')
    return
  }

  try {
    const { USUARIOS } = await fnConnectDirectCollection()

    const opts = {
      readConcern: new ReadConcern('majority'),
      readPreference: ReadPreference.primary,
    }

    // Busca usuário pelo autorizacao_id
    const usuario = await USUARIOS.findOne({ autorizacao_id: autorizacaoId }, opts) as TUsuario | null

    if (usuario) {
      // Formata os campos para corresponder exatamente ao tipo TUsuario
      const data: TUsuario = {
        ...usuario,
        _id: usuario._id ? String(usuario._id) : null,
        autorizacao_id: usuario.autorizacao_id ? String(usuario.autorizacao_id) : null,
        empresa: usuario.empresa ?? null
      }

      fnRespostaIO(socket, IO.USUARIO_MEUS_DADOS, 'U-OK-PROCURAR', data)
    } else {
      fnRespostaIO(socket, IO.USUARIO_MEUS_DADOS, 'U-ATT-PROCURAR', null)
    }
  } catch (error) {
    console.error('❌ Erro em ioUsuarioMeusDados:', error)
    fnRespostaIO(socket, IO.USUARIO_MEUS_DADOS, 'U-ERROR-PROCURAR', 'Erro interno ao buscar usuário')
  }
}
