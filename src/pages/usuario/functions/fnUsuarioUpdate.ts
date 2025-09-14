//src/sockets/usuario/functions/fnUpdateUsuario.ts
import { ObjectId, Db, ClientSession } from 'mongodb'
import { TUsuario } from '@/types/TUsuario'
import { fnPadraoBairroSlug } from '@/pages/usuario/functions/fnPadraoBairroSlug'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnSessaoAtomica } from '@/db/fnSessaoAtomica'

export const fnUpdateUsuario = async (usuario_id: string, params: Partial<TUsuario>) => {
    try {
        if (!usuario_id || !ObjectId.isValid(usuario_id)) {
            return { status: 'error', message: 'ID do usuário inválido ou ausente.' }
        }

        // Evita atualizar o _id
        const { _id, ...paramsSemId } = params

        const result = await fnSessaoAtomica(async (db: Db, session: ClientSession) => {
            const { USUARIOS } = await fnConnectDirectCollection()

            const _filter = { _id: new ObjectId(usuario_id) }
            const _update = {
                $set: {
                    ...paramsSemId,
                    bairro_slug: fnPadraoBairroSlug(params.bairro ?? '', params.municipio ?? '', params.estado ?? ''),
                    atualizado_em: new Date()
                }
            }

            const _res = await (USUARIOS as any).updateOne(_filter, _update, { session, writeConcern: { w: 'majority', wtimeout: 3000 } })
            if (!_res.acknowledged || _res.matchedCount === 0) {
                throw new Error('❌ Nenhum documento foi atualizado. Verifique o ID.')
            }

            const usuarioAtualizado = await (USUARIOS as any).findOne(_filter, { session })
            if (!usuarioAtualizado) throw new Error('❌ Não foi possível recuperar o usuário após atualização.')

            return usuarioAtualizado
        })

        return { status: 'ok', data: result as TUsuario }
    } catch (error) {
        console.log('❌ Erro na atualização do usuário:', error)
        return { status: 'error', message: 'Erro na atualização do usuário.', error }
    }
}