// src/sockets/gas-agua/MenorPrecoGas.ts
import { Socket } from 'socket.io'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { TProduto, produtoValues } from '@/types/TProduto'

type TRequestData = string[] // array de empresa_slug

// Recebe as empresas para buscar o menor preço do GÁS, exemplo: [ 'ZEDOGAS', 'MARIADOGAS' ]
export const MenorPrecoGas = async (empresas: TRequestData, socket: Socket) => {
    
    try {
        // ✅ Se nenhuma empresa aberta, retorna produto default imediatamente
        if (!Array.isArray(empresas) || empresas.length === 0) {
            console.warn('Nenhuma empresa aberta. Retornando produto default de GÁS.')
            fnRespostaIO(socket, IO.MENOR_PRECO_GAS, 'MENOR-PRECO-GAS-OK', [produtoValues])
            return
        }

        const { PRODUTOS } = await fnConnectDirectCollection()

        const filtro: Record<string, any> = { 
            empresa_categoria: 'REVENDA-GAS-AGUA',
            produto_categoria: 'GAS',
            empresa_slug: { $in: empresas }
        }

        const produtos: TProduto[] = await PRODUTOS.find<TProduto>(filtro, {
            readConcern: { level: 'majority' },
            readPreference: 'primary'
        }).toArray()

        // Se não houver produtos encontrados, retorna produto default
        if (!produtos || produtos.length === 0) {
            console.warn('Nenhum produto de GÁS encontrado para as empresas informadas. Retornando produto default.')
            fnRespostaIO(socket, IO.MENOR_PRECO_GAS, 'MENOR-PRECO-GAS-OK', [produtoValues])
            return
        }

        // Log para conferência
        console.log('Produtos encontrados GÁS:', produtos.map(p => ({
            slug: p.empresa_slug,
            descricao: p.produto_descricao,
            preco: p.produto_preco_base
        })))

        // Encontrar o produto com menor preço
        const menorProduto = produtos.reduce((menor, atual) =>
            Number(atual.produto_preco_base) < Number(menor.produto_preco_base) ? atual : menor
        )

        // Envia resposta para o front
        fnRespostaIO(socket, IO.MENOR_PRECO_GAS, 'MENOR-PRECO-GAS-OK', [menorProduto])

    } catch (error) {
        console.error('❌ Erro em ioGasMenorPreco:', error)
        // Em caso de erro, também retorna produto default
        fnRespostaIO(socket, IO.MENOR_PRECO_GAS, 'MENOR-PRECO-GAS-ERROR', [produtoValues])
    }
}
