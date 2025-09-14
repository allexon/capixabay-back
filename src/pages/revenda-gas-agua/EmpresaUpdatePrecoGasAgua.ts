// src/sockets/revenda-gas-agua/ioPrecoGasAguaUpdate.ts
import { Socket } from 'socket.io'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { IO } from '@/sockets/IO'
import { TProduto } from '@/types/TProduto'

type TUpdateRequestData = {
    empresa_id: string
    preco_gas: number | null
    preco_agua: number | null
}

export const EmpresaUpdatePrecoGasAgua = async (data: TUpdateRequestData, socket: Socket) => {
    try {
        const { empresa_id, preco_gas, preco_agua } = data
        if (!empresa_id) {
            console.log('🚫 empresa_id não fornecido')
            fnRespostaIO(socket, IO.EMPRESA_UPDATE_PRECO_GAS_AGUA, 'EMPRESA-UPDATE-PRECO-GAS-AGUA-ATT', null)
            return
        }

        if (
            (preco_gas !== null && (isNaN(preco_gas) || preco_gas <= 0)) ||
            (preco_agua !== null && (isNaN(preco_agua) || preco_agua <= 0))
        ) {
            console.log('🚫 Preços inválidos:', { preco_gas, preco_agua })
            fnRespostaIO(socket, IO.EMPRESA_UPDATE_PRECO_GAS_AGUA, 'EMPRESA-UPDATE-PRECO-GAS-AGUA-INVALID', {
                message: 'Os preços devem ser maiores que zero.'
            })
            return
        }

        const { PRODUTOS } = await fnConnectDirectCollection()

        // Atualiza o preço do GÁS se um valor for fornecido
        if (preco_gas !== null) {
            const result = await PRODUTOS.updateOne(
                { empresa_id, produto_categoria: 'GAS' },
                { $set: { produto_preco_base: preco_gas } },
                { upsert: true }
            )
            console.log('📊 Atualização GÁS:', result)
        }

        // Atualiza o preço da ÁGUA se um valor for fornecido
        if (preco_agua !== null) {
            const result = await PRODUTOS.updateOne(
                { empresa_id, produto_categoria: 'AGUA' },
                { $set: { produto_preco_base: preco_agua } },
                { upsert: true }
            )
            console.log('📊 Atualização ÁGUA:', result)
        }

        // Retorna os preços atualizados
        const res = {
            empresa_id,
            preco_gas,
            preco_agua
        }

        console.log('✅ Dados atualizados:', res)
        fnRespostaIO(socket, IO.EMPRESA_UPDATE_PRECO_GAS_AGUA, 'EMPRESA-UPDATE-PRECO-GAS-AGUA-OK', res)

    } catch (error) {
        console.error('❌ Erro em EmpresaUpdatePrecoGasAgua:', error)
        fnRespostaIO(socket, IO.EMPRESA_UPDATE_PRECO_GAS_AGUA, 'EMPRESA-UPDATE-PRECO-GAS-AGUA-ERROR', {
            message: 'Erro ao atualizar preços no servidor.'
        })
    }
}