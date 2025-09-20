// RoutersIO.ts
import { Server, Socket } from 'socket.io'
import path from 'path'
import { rotasDinamicasIO } from '@/sockets/IO'
import { ENV } from '@/config/env-config'

/*
const resolvePath = (aliasPath: string) => {
    // 💡 A forma correta de verificar o ambiente agora é através de ENV.NODE_ENV
    const isDev = ENV.NODE_ENV === 'DEV'
    const rootDir = path.resolve(__dirname, '..')
    const _relativePath = aliasPath.replace(/^@\//, '')
    const finalPath = isDev ? path.resolve(rootDir, 'src', _relativePath) : path.resolve(rootDir, 'dist', _relativePath)
    return isDev ? finalPath + '.ts' : finalPath + '.js'
}
*/

const resolvePath = (aliasPath: string) => {
    const isDev = ENV.NODE_ENV === 'DEV';
    const relativePath = aliasPath.replace(/^@\//, ''); // Remove o '@/' -> 'pages/login/Login'

    if (isDev) {
        // Em DEV, o __dirname está em /dist/config. Subimos 2 níveis para a raiz e entramos em /src
        return path.join(__dirname, '..', '..', 'src', relativePath + '.ts');
    } else {
        // Em PROD, o __dirname está em /deploy/backend/config. Subimos 1 nível para /deploy/backend
        return path.join(__dirname, '..', relativePath + '.js');
    }
}

type TTipoDataSocket = (data: any, socket: Socket, io?: Server) => Promise<void>

export const RoutersIO = (io: Server) => {

    io.on('connection', (socket: Socket) => {
        console.log('✅ ::: NOVO SOCKET ::::')

        rotasDinamicasIO.forEach(({ canal, local, fn }) => {
            if (!local || !fn) {
                console.warn(`[RoutersIO] Ignorando canal '${canal}' porque arquivo ou função é nula`)
                return
            }

            socket.on(canal, async (data: any) => {
                try {
                    const _caminho = resolvePath(local)
                    const _import = await import(_caminho)
                    const _handler = _import[fn] as TTipoDataSocket

                    if (typeof _handler !== 'function') {
                        throw new Error(`Função '${fn}' não encontrada em '${local}'`)
                    }

                    if (_handler.length === 3) {
                        await _handler(data, socket, io)
                    } else {
                        await _handler(data, socket)
                    }

                } catch (error) {
                    console.error(`❌ Erro no canal [${canal}] vindo de [${local}]`, error)
                }
            })
        })

        socket.on('disconnect', (reason) => {
            console.warn(`❌ Cliente desconectado: ${socket.id}, motivo: ${reason}`)
        })
    })
}