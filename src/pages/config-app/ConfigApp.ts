//src/pages/config-app/ConfigApp.ts
import { Socket } from 'socket.io'
import { ObjectId, UpdateFilter } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { IO } from '@/sockets/IO' // Importação assumida
import { fnRespostaIO } from '@/sockets/fnRespostaIO' // Importação assumida
import { configAppStates, type TConfigApp } from '@/pages/config-app/TConfigApp'

// Tipagem de dado esperado via WebSocket
interface IConfigAppData {
    isInstallApp: boolean // true para instalar, false para remover
    _id: string | null // ObjectId como string, ou null se for a primeira vez
}

export const ConfigApp = async (data: IConfigAppData, socket: Socket) => {
    // 1. Validação de Entrada
    const isInstalling = data?.isInstallApp
    const id = data?._id

    if (typeof isInstalling !== 'boolean') {
        console.warn('⚠️ Requisição inválida: isInstallApp deve ser booleano')
        fnRespostaIO(socket, IO.CONFIGAPP, 'CONFIGAPP-ERROR')
        return
    }

    try {
        const { CONFIGAPP } = await fnConnectDirectCollection()
        let result: TConfigApp | null = null
        let objectId: ObjectId | null = null
        
        // 2. Tentar converter o _id se ele existir e for válido
        if (id && id !== 'null') {
            try {
                // Tentativa de conversão para ObjectId
                objectId = new ObjectId(id)
            } catch (error) {
                // Se falhar, tratamos como se o ID fosse nulo e forçamos a inserção (Caso 2)
                console.warn(`⚠️ _id inválido ('${id}'). Tratando como primeira instalação`)
            }
        }
        
        // 3. Definir o filtro e as operações de atualização
        const filter: any = objectId ? { _id: objectId } : {}

        const updateOperation: UpdateFilter<TConfigApp> = {
            $set: {
                is_install_app: isInstalling,
                atualizado_em: new Date(),
            },
            // Incrementa/Decrementa a contagem
            $inc: {
                qtde_install_app: isInstalling ? 1 : -1
            },
            // Define criado_em apenas se o documento for inserido pelo upsert
            $setOnInsert: {
                criado_em: new Date(),
                _id: null // Necessário para garantir que o _id padrão do configAppStates não seja inserido como ObjectId
            }
        }

        // 4. Lógica de Upsert (Atualizar ou Criar)

        if (objectId) {
            // Caso 1: ID válido, tenta atualizar (ou criar se não existir usando upsert)
            
            // Tipagem para FindAndModifyResult, usamos 'any' aqui para resolver o conflito de tipo do driver
            const updateResult: any = await CONFIGAPP.findOneAndUpdate(
                filter,
                updateOperation,
                { 
                    returnDocument: 'after', // Retorna o documento APÓS a modificação
                    upsert: true, // Se não encontrar, insere um novo
                }
            )
            
            // CORREÇÃO: Acessa 'value' do objeto FindAndModifyResult (que é o documento)
            if (updateResult && updateResult.value) {
                result = updateResult.value as TConfigApp
            } else {
                console.error('❌ findOneAndUpdate falhou ao retornar o documento, mesmo com upsert')
            }

        } else {
            // Caso 2: Primeira instalação (ID nulo/inválido), força a criação
            
            const initialQtde = isInstalling ? 1 : 0 

            // CORREÇÃO: newDoc usa TConfigApp, o que permite _id: null, resolvendo o conflito com Omit
            const newDoc: TConfigApp = {
                ...configAppStates,
                is_install_app: isInstalling,
                qtde_install_app: initialQtde,
                criado_em: new Date(),
                atualizado_em: new Date(),
                _id: null // Garante que o MongoDB crie o ObjectId
            }

            const insertResult = await CONFIGAPP.insertOne(newDoc as TConfigApp)
            
            if (insertResult.acknowledged) {
                // Busca o documento recém-criado para obter o _id e a estrutura completa
                const insertedDoc = await CONFIGAPP.findOne({ _id: insertResult.insertedId })
                result = insertedDoc as TConfigApp
            } else {
                console.error('❌ Falha ao inserir novo ConfigApp')
            }
        }

        // 5. Resposta ao Cliente
        if (result) {
            // Retorna o documento atualizado/inserido
            fnRespostaIO(socket, IO.CONFIGAPP, 'CONFIGAPP-OK', result)
        } else {
            fnRespostaIO(socket, IO.CONFIGAPP, 'CONFIGAPP-ERROR')
        }

    } catch (error) {
        console.error('❌ Erro no processamento ConfigApp:', error)
        fnRespostaIO(socket, IO.CONFIGAPP, 'CONFIGAPP-ERROR')
    }
}
