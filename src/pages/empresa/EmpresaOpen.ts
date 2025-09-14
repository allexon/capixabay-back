// src/sockets/empresa/OpenEmpresa.ts
import { Socket } from 'socket.io'
import { ObjectId } from 'mongodb'
import { ReadConcern, ReadPreference } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { fnBroadcastIO } from '@/sockets/fnBroadcastIO'

export const EmpresaOpen = async (data: any, socket: Socket) => {

    const CANAL = IO.EMPRESA_OPEN
    const RESPOSTA_IO = 'EMPRESA-OPEN'
    
    // Validação do empresa_id
    const empresaId = data?.empresa_id
    const aberta = data?.aberta ?? true

    if (!empresaId || typeof empresaId !== 'string') {
        console.warn('⚠️ Requisição inválida: empresa_id ausente ou inválido')        
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
        return
    }

    // Conversão do empresa_id para ObjectId
    let objEmpresaId: ObjectId
    try {
        objEmpresaId = new ObjectId(empresaId)
    } catch (error) {
        console.warn('⚠️ Erro ao converter empresa_id para ObjectId:', error)        
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
        return
    }

    try {
        // Conexão com a coleção EMPRESAS
        const { EMPRESAS } = await fnConnectDirectCollection()
        const opts = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }

        // Atualização do campo aberta
        const result = await EMPRESAS.updateOne(
            { _id: objEmpresaId },
            { $set: { aberta: aberta, atualizado_em: new Date() } },
            opts
        )

        if (result.modifiedCount > 0) {
            // Emite que conseguiu Fechar Empresa
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-OK`, { empresa_id: empresaId, aberta: true }) // emit
            fnBroadcastIO(socket, CANAL, `${RESPOSTA_IO}-OK`, { empresa_id: empresaId, aberta: true })  // broadcast
        } else {
            console.warn('⚠️ OPEN EMPRRESA :', empresaId)
            fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ATT`) // emit            
        }
    } catch (error) {
        console.error('❌ Erro no EMPRESA_OPEN:', error)
        fnRespostaIO(socket, CANAL, `${RESPOSTA_IO}-ERROR`)
    }
}