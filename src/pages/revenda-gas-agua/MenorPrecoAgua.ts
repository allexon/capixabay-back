// src/sockets/gas-agua/MenorPrecoAgua.ts
import { Socket } from 'socket.io'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { TProduto, produtoValues } from '@/types/TProduto' // importe o default

type TRequestData = string[] // array de empresa_slug

export const MenorPrecoAgua = async (empresas: TRequestData, socket: Socket) => {
    
    try {
        // Se nenhuma empresa aberta, retorna produto default imediatamente
        if (!Array.isArray(empresas) || empresas.length === 0) {
            console.warn('Nenhuma empresa aberta. Retornando produto default.')
            fnRespostaIO(socket, IO.MENOR_PRECO_AGUA, 'MENOR-PRECO-AGUA-OK', [produtoValues])
            return
        }

        const { PRODUTOS } = await fnConnectDirectCollection()

        // Filtro simplificado agora que todos os registros usam produto_categoria
        const filtro: Record<string, any> = { 
            empresa_categoria: 'REVENDA-GAS-AGUA', 
            produto_categoria: 'AGUA',
            empresa_slug: { $in: empresas }
        }

        // Busca no MongoDB
        const produtos: TProduto[] = await PRODUTOS.find<TProduto>(filtro, {
            readConcern: { level: 'majority' },
            readPreference: 'primary'
        }).toArray()

        // Se não encontrar produtos, retorna default
        if (!produtos || produtos.length === 0) {
            console.warn('Nenhum produto encontrado para as empresas informadas. Retornando produto default.')
            fnRespostaIO(socket, IO.MENOR_PRECO_AGUA, 'MENOR-PRECO-AGUA-OK', [produtoValues])
            return
        }

        // Encontrar o produto com menor preço
        const menorProduto = produtos.reduce((menor, atual) =>
            Number(atual.produto_preco_base) < Number(menor.produto_preco_base) ? atual : menor
        )
        
        // Envia resposta para o front
        fnRespostaIO(socket, IO.MENOR_PRECO_AGUA, 'MENOR-PRECO-AGUA-OK', [menorProduto])

    } catch (error) {
        console.error('❌ Erro em ioGasMenorPreco:', error)
        // Em caso de erro, também retorna produto default
        fnRespostaIO(socket, IO.MENOR_PRECO_AGUA, 'MENOR-PRECO-AGUA-ERROR', [produtoValues])
    }
}