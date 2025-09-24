// src/sockets/usuario/Usuario.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { fnInsertUsuario } from '@/pages/usuario/functions/fnUsuarioInsert'
import { fnProcurarUsuario } from '@/pages/usuario/functions/fnProcurarUsuario'
import { fnUpdateUsuario } from '@/pages/usuario/functions/fnUsuarioUpdate'

//*************************** FUNÇÃO PRINCIPAL  ***************************/
export const Usuario = async (req: any, socket: Socket) => {

        console.log('::: 1 DADOS DO USUARIO :::::', req)

    // Ajuste: verifica se veio data ou veio direto o objeto
    const data = req.data ?? req

    if (!data?.autorizacao_id) {
        fnRespostaIO(socket, IO.USUARIO, 'USUARIO-REQUISICAO-ERROR')
        return
    }

    const autorizacao_id = data.autorizacao_id
    let updateResult: boolean = false
    try {
        // Procura na Coleção USUARIOS o USUARIO -> AUTORIZACAO ID
        const usuario = await fnProcurarUsuario(autorizacao_id) // retorna os dados do usuario
        console.log('::: 2 DADOS DO USUARIO :::::', usuario)

        // UPDATE USUARIO
        if (usuario) {
            const res = await fnUpdateUsuario(String(usuario._id), data)
            if (res.status === 'ok') {
                updateResult = true
                fnRespostaIO(socket, IO.USUARIO, 'USUARIO-UPDATE-OK', res.data)
            } else {
                fnRespostaIO(socket, IO.USUARIO, 'USUARIO-UPDATE-ATT')
            }
        } else {
            // INSERT USUARIO
            const res = await fnInsertUsuario(data)
            if (res.status === 'ok') {
                updateResult = false
                fnRespostaIO(socket, IO.USUARIO, 'USUARIO-INSERT-OK', res.data)
            } else {
                fnRespostaIO(socket, IO.USUARIO, 'USUARIO-INSERT-ATT')
            }
        }
    } catch (error) {
        updateResult? 
            fnRespostaIO(socket, IO.USUARIO, 'USUARIO-UPDATE-ERROR') :
            fnRespostaIO(socket, IO.USUARIO, 'USUARIO-INSERT-ERROR') 
    }

}