//src/sockets/menu-principal/MenuPrincipal.ts
import { Socket } from 'socket.io'
import { ReadConcern, ReadPreference } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'

export const MenuPrincipal = async (data: any, socket: Socket) => {
    
    try {
        const { MENU_PRINCIPAL } = await fnConnectDirectCollection()
        const opts = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }

        const data = await MENU_PRINCIPAL.find({}, opts).sort({ ordem: 1 }).toArray()

        if (data && data.length > 0) {
            fnRespostaIO(socket, IO.MENU_PRINCIPAL, 'MENU-PRINCIPAL-OK', data)
        } else {
            fnRespostaIO(socket, IO.MENU_PRINCIPAL, 'MENU-PRINCIPAL-ATT')
        }
    } catch (error) {
        console.error('❌ Erro no MENU PRINCIPAL GET DATA:', error)
        fnRespostaIO(socket, IO.MENU_PRINCIPAL, 'MENU-PRINCIPAL-ERROR')
    }
}