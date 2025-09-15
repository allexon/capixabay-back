console.log('..http totalizacoes...')

import { Request, Response } from 'express'
import { fnPedidosEnviadosAceitos } from '@/pages/pedido/functions/fnPedidosEnviadosAceitos'

export const fnHttpListaPedidosEnviadosAceitos = async (req: Request, res: Response) => {
    const { usuario_id } = req.body
    if (!usuario_id) {
        return res.status(400).json({ status: 'error', message: 'ID do usuário não fornecido' })
    }

    try {
        const result = await fnPedidosEnviadosAceitos(usuario_id)
        return res.json({ status: 'ok', data: Array.isArray(result) ? result : result })
    } catch (error) {
        console.error('Erro em fnHttpTotalizacoes:', error)
        return res.status(500).json({ status: 'error', message: 'Erro ao processar totalizações' })
    }
}