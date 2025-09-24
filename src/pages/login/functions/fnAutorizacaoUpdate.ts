//src/login/sockets/functions/fnAutorizacaoUpdate.ts
// src/login/sockets/functions/fnAutorizacaoUpdate.ts
import { ReadConcern, ReadPreference } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { TAutorizacao } from '@/types/TAutorizacao'

export const fnAutorizacaoUpdate = async (data: TAutorizacao, tipo_update: string) => {
    const { AUTORIZACOES } = await fnConnectDirectCollection()
    const replicasetParams = {
        readConcern: new ReadConcern('majority'),
        readPreference: ReadPreference.primary
    }

    if (!data?._id) {
        console.error('fnAutorizacaoUpdate: _id ausente em data')
        return { status: false, data: null }
    }

    // Função para gerar novo código de acesso
    const fnGerarCodigoAcesso = () =>
        Math.floor(100000 + Math.random() * 900000).toString()

    const _novo_codigo_acesso = fnGerarCodigoAcesso()

    // Preparar dados de atualização dependendo do tipo de update
    const updateNovoCodigoAcesso: TAutorizacao = {
        ...data,
        codigo_acesso: _novo_codigo_acesso,
        codigo_acesso_enviado: true,
        codigo_acesso_verificado: false,
        email_verificado: false,
        numero_acessos: (data.numero_acessos || 0) + 1,
        atualizado_em: new Date()
    }

    const updateCodigoAtualVerificado: TAutorizacao = {
        ...data,
        codigo_acesso_enviado: true,
        codigo_acesso_verificado: true,
        email_verificado: true,
        numero_acessos: (data.numero_acessos || 0) + 1,
        atualizado_em: new Date()
    }

    // Escolhe qual update aplicar
    let updateData: TAutorizacao
    if (tipo_update === 'NOVO-CODIGO-ACESSO') {
        updateData = updateNovoCodigoAcesso        
    } else {
        updateData = updateCodigoAtualVerificado        
    }

    // Remove _id antes de atualizar no Mongo
    const { _id, ...dataWithoutId } = updateData
    const updateDoc = { $set: dataWithoutId }

    // Filtro com string (porque no banco o _id está como string)
    const filtro = { _id: data._id }

    try {
        const result = await AUTORIZACOES.updateOne(filtro, updateDoc, replicasetParams)       

        if (result.acknowledged && result.matchedCount > 0) {
            return { status: true, data: updateData }
        } else {
            return { status: false, data: null }
        }
    } catch (error) {
        console.error('Erro ao atualizar autorização:', error)
        return { status: false, data: null }
    }
}