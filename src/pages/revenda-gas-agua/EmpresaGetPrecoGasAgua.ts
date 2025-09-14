// src/sockets/revenda-gas-agua/EmpresaIdGetPrecoGasAgua.ts
import { Socket } from 'socket.io'
import { ReadConcern, ReadPreference } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { IO } from '@/sockets/IO'
import { TProduto } from '@/types/TProduto'

type TGetRequestData = {
    empresa_id: string
}

export const EmpresaGetPrecoGasAgua = async (data: TGetRequestData, socket: Socket) => {
    console.log('::::: DATA BACK :::::', data)

    try {
        const { empresa_id } = data
        if (!empresa_id) {
            console.log('🚫 empresa_id não fornecido')
            fnRespostaIO(socket, IO.EMPRESA_GET_PRECO_GAS_AGUA, 'EMPRESA-GET-PRECO-GAS-AGUA-ATT', null)
            return
        }

        const { PRODUTOS } = await fnConnectDirectCollection()
        const _replicaSetParams = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }

        // Filtra produtos por empresa_id e produto_categoria (GAS ou AGUA)
        const produtos = await PRODUTOS.find<TProduto>(
            { empresa_id: empresa_id, produto_categoria: { $in: ['GAS', 'AGUA'] } },
            _replicaSetParams
        ).toArray()

        console.log('📊 Produtos encontrados:', produtos)

        if (!produtos || produtos.length === 0) {
            console.log('🚫 Nenhum produto encontrado para empresa_id:', empresa_id)
            fnRespostaIO(socket, IO.EMPRESA_GET_PRECO_GAS_AGUA, 'EMPRESA-GET-PRECO-GAS-AGUA-ATT', null)
            return
        }

        // Construir o objeto de resposta
        const _data = {
            empresa_id,
            empresa_nome_fantasia: produtos[0].empresa_nome_fantasia || 'Nome não encontrado',
            preco_gas: null as number | null,
            preco_agua: null as number | null
        }

        // Preencher preços com base em produto_categoria
        produtos.forEach(produto => {
            if (produto.produto_categoria === 'GAS') {
                _data.preco_gas = produto.produto_preco_base
            }
            if (produto.produto_categoria === 'AGUA') {
                _data.preco_agua = produto.produto_preco_base
            }
        })

        console.log('✅ Dados a serem retornados:', _data)
        fnRespostaIO(socket, IO.EMPRESA_GET_PRECO_GAS_AGUA, 'EMPRESA-GET-PRECO-GAS-AGUA-OK', _data)

    } catch (error) {
        console.error('❌ Erro em EmpresaIdGetPrecoGasAgua:', error)
        fnRespostaIO(socket, IO.EMPRESA_GET_PRECO_GAS_AGUA, 'EMPRESA-GET-PRECO-GAS-AGUA-ERROR', null)
    }
}