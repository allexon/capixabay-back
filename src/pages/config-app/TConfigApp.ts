// src/types/TConfigApp.ts
import { ObjectId } from 'mongodb'

export type TConfigApp = {
    _id: ObjectId | null
    is_install_app: boolean
    qtde_install_app: number
    criado_em: Date | null
    atualizado_em: Date | null
}

// valores default
export const configAppStates: TConfigApp = {
    _id: null,
    is_install_app: false,
    qtde_install_app: 0,
    criado_em: new Date(),
    atualizado_em: new Date()
}