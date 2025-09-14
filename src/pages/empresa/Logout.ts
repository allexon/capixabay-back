// src/sockets/empresa/Logout.ts
import { Socket } from 'socket.io'
import { ObjectId, ReadConcern, ReadPreference, WithId, Document } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'

export const Logout = async (data: any, socket: Socket) => {
    
    const empresaId = data?.empresa_id
    const aberta = data?.aberta ?? false
    
    if (!empresaId || typeof empresaId !== 'string') {
        console.warn('⚠️ Requisição inválida: empresa_id ausente ou inválido')
        fnRespostaIO(socket, IO.LOGOUT, 'LOGOUT-ERROR')
        return
    }

    // Converter string para ObjectId somente para a query do Mongo
    let objEmpresaId: ObjectId
    try {
        objEmpresaId = new ObjectId(empresaId)
    } catch (error) {
        console.warn('⚠️ Erro ao converter empresa_id para ObjectId:', error)
        fnRespostaIO(socket, IO.LOGOUT, 'LOGOUT-ERROR')
        return
    }

    try {
        const { EMPRESAS } = await fnConnectDirectCollection()
        const opts = { readConcern: new ReadConcern('majority'), readPreference: new ReadPreference('primary') }

        // 🔹 Tipo any para não quebrar TypeScript
        const filter: any = { _id: objEmpresaId }
        const result = await EMPRESAS.updateOne(filter, { $set: { aberta, atualizado_em: new Date() } }, opts)
        
        if (result.modifiedCount > 0) {            
            fnRespostaIO(socket, IO.LOGOUT, 'LOGOUT-OK', result)
        } else {            
            console.warn('⚠️ LOGOUT EMPRESA não modificada:', empresaId)
            fnRespostaIO(socket, IO.LOGOUT, 'LOGOUT-ATT')
        }
    } catch (error) {        
        fnRespostaIO(socket, IO.LOGOUT, 'LOGOUT-ERROR')
    }
}