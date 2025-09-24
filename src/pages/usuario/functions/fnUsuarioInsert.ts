// src/sockets/usuario/functions/fnInsertUsuario.ts
import { ObjectId, Db, ClientSession } from 'mongodb'
import { TUsuario } from '@/types/TUsuario'
import { fnPadraoBairroSlug } from '@/pages/usuario/functions/fnPadraoBairroSlug'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnSessaoAtomica } from '@/db/fnSessaoAtomica'

/**
 * Insere usuário e atualiza AUTORIZACAO dentro de uma transação
 */
export const fnInsertUsuario = async (params: Partial<TUsuario>) => {
    try {
        // validação obrigatória
        if (!params.autorizacao_id || !params.autorizacao_email_acesso) {
            return { status: 'error', message: 'Autorização obrigatória.' }
        }

        const now = new Date()

        // monta o objeto no padrão TUsuario
        const _usuarioObj: TUsuario = {
            _id: params._id ?? null,
            nome: params.nome ?? null,
            avatar: params.avatar ?? null,
            celular: params.celular ?? null,
            autorizacao_id: params.autorizacao_id ?? null,
            autorizacao_email_acesso: params.autorizacao_email_acesso ?? null,
            cep: params.cep ?? null,
            logradouro: params.logradouro ?? null,
            numero_endereco: params.numero_endereco ?? null,
            estado: params.estado ?? null,
            municipio: params.municipio ?? null,
            bairro: params.bairro ?? null,
            bairro_slug: fnPadraoBairroSlug(
                params.bairro ?? '',
                params.municipio ?? '',
                params.estado ?? ''
            ),
            ponto_referencia: params.ponto_referencia ?? null,
            tipo_endereco: params.tipo_endereco ?? 'CASA',
            edificio_nome: params.edificio_nome ?? null,
            andar: params.andar ?? null,
            apartamento_numero: params.apartamento_numero ?? null,
            bloco: params.bloco ?? null,
            empresa: params.empresa ?? null,
            criado_em: now,
            atualizado_em: now,
            contador_pedido: 0,
        }

        // executa insert dentro de sessão atômica
        const result = await fnSessaoAtomica(
            async (db: Db, session: ClientSession) => {
                const { USUARIOS, AUTORIZACOES } = await fnConnectDirectCollection()

                // --- prepara objeto para MongoDB ---
                const mongoUsuario = {
                    ..._usuarioObj,
                    _id: _usuarioObj._id
                        ? new ObjectId(_usuarioObj._id)
                        : new ObjectId(),
                    autorizacao_id: _usuarioObj.autorizacao_id, // string
                }

                // 1) Insere usuário
                const insertRes = await USUARIOS.insertOne(mongoUsuario as any, {
                    session,
                    writeConcern: { w: 'majority', wtimeout: 3000 },
                })
                if (!insertRes.acknowledged) {
                    throw new Error('❌ Falha no insert em USUARIOS')
                }
                
                // 2) Atualiza a autorização vinculada
                console.log(':::: autorizacao_id ::::::',  _usuarioObj.autorizacao_id)
                
                const updateRes = await AUTORIZACOES.updateOne(
                    { _id: new ObjectId(String(_usuarioObj.autorizacao_id)) } as any, // 👈 forçamos ObjectId
                    { $set: { usuario_cadastro_completo: true, atualizado_em: now } },
                    { session, writeConcern: { w: 'majority', wtimeout: 3000 } }
                )
                if (!updateRes.acknowledged || updateRes.matchedCount === 0) {
                    throw new Error('❌ Falha na atualização de AUTORIZACOES')
                }

                // --- retorna objeto no padrão TUsuario (string no _id) ---
                return {
                    ..._usuarioObj,
                    _id: mongoUsuario._id.toHexString(),
                    autorizacao_id: mongoUsuario.autorizacao_id,
                }
            }
        )

        // se tudo ok
        return { status: 'ok', data: result }
    } catch (error) {
        console.error('❌ Erro no insert (transação revertida):', error)
        // transação garante consistência
        return { status: 'error', data: null }
    }
}


/*
import { ObjectId, Db, ClientSession } from 'mongodb'
import { TUsuario } from '@/types/TUsuario'
import { fnPadraoBairroSlug } from '@/pages/usuario/functions/fnPadraoBairroSlug'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnSessaoAtomica } from '@/db/fnSessaoAtomica'

export const fnInsertUsuario = async (params: Partial<TUsuario>) => {
    try {
        // validação obrigatória
        if (!params.autorizacao_id || !params.autorizacao_email_acesso) {
            return { status: 'error', message: 'Autorização obrigatória.' }
        }

        const now = new Date()

        // monta o objeto no padrão TUsuario
        const _usuarioObj: TUsuario = {
            _id: params._id ?? null,
            nome: params.nome ?? null,
            avatar: params.avatar ?? null,
            celular: params.celular ?? null,
            autorizacao_id: params.autorizacao_id ?? null,
            autorizacao_email_acesso: params.autorizacao_email_acesso ?? null,           
            cep: params.cep ?? null,
            logradouro: params.logradouro ?? null,
            numero_endereco: params.numero_endereco ?? null,
            estado: params.estado ?? null,
            municipio: params.municipio ?? null,
            bairro: params.bairro ?? null,
            bairro_slug: fnPadraoBairroSlug(params.bairro ?? '', params.municipio ?? '', params.estado ?? ''),
            ponto_referencia: params.ponto_referencia ?? null,
            tipo_endereco: params.tipo_endereco ?? 'CASA',
            edificio_nome: params.edificio_nome ?? null,
            andar: params.andar ?? null,
            apartamento_numero: params.apartamento_numero ?? null,
            bloco: params.bloco ?? null,
            empresa: params.empresa ?? null,
            criado_em: now,
            atualizado_em: now,
            contador_pedido: 0,
        }

        // executa insert dentro de sessão atômica
        const result = await fnSessaoAtomica(async (db: Db, session: ClientSession) => {
            const { USUARIOS, AUTORIZACOES } = await fnConnectDirectCollection()

            // --- prepara objeto para MongoDB ---
            const mongoUsuario = {
                ..._usuarioObj,
                _id: _usuarioObj._id ? new ObjectId(_usuarioObj._id) : new ObjectId(),
                // corrigido: autorizacao_id permanece STRING
                autorizacao_id: _usuarioObj.autorizacao_id
            }

            // insere usuário
            const _res = await (USUARIOS as any).insertOne(mongoUsuario, {
                session,
                writeConcern: { w: 'majority', wtimeout: 3000 }
            })
            if (!_res.acknowledged) throw new Error('❌ Falha no insert em USUARIOS')

            // atualiza a autorização para indicar cadastro completo
            if (!_usuarioObj.autorizacao_id) {
                throw new Error('autorizacao_id inválido')
            }

            await (AUTORIZACOES as any).updateOne(
                { _id: new ObjectId(_usuarioObj.autorizacao_id) }, // aqui converte string para ObjectId
                { $set: { usuario_cadastro_completo: true, atualizado_em: now } },
                { session, writeConcern: { w: 'majority', wtimeout: 3000 } }
            )

            // --- retorna objeto no padrão TUsuario, sem ObjectId ---
            return {
                ..._usuarioObj,
                _id: mongoUsuario._id.toHexString(), // string para front/back
                autorizacao_id: mongoUsuario.autorizacao_id // string
            }
        })

        return { status: 'ok', data: result }
    } catch (error) {
        console.error('❌ Erro no insert:', error)
        return { status: 'error', message: 'Erro no insert.', error }
    }
}
*/