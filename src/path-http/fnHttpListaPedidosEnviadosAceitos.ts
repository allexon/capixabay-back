console.log('..http totalizacoes...')
import { Request, Response } from 'express'
import { fnPedidosEnviadosAceitos } from '@/pages/pedido/functions/fnPedidosEnviadosAceitos'

export const fnHttpListaPedidosEnviadosAceitos = async (req: Request, res: Response) => {
    console.log('📥 Requisição recebida em /api/lista-pedidos-enviados-aceitos:', req.body)
    const { usuario_id } = req.body

    if (!usuario_id) {
        console.warn('⚠️ ID do usuário não fornecido')
        return res.status(400).json({ status: 'error', message: 'ID do usuário não fornecido' })
    }

    try {
        console.log('🔄 Processando fnPedidosEnviadosAceitos para usuario_id:', usuario_id)
        const result = await fnPedidosEnviadosAceitos(usuario_id)
        console.log('✅ Resultado obtido:', result)
        return res.json({ status: 'ok', data: Array.isArray(result) ? result : result })
    } catch (error: any) {
        console.error('❌ Erro em fnHttpListaPedidosEnviadosAceitos:', error.message)
        return res.status(500).json({ status: 'error', message: 'Erro ao processar totalizações' })
    }
}