// src/types/TMenuPrincipal.ts (back)
export type TMenuPrincipal = {
    _id?: string
    nome: string                       // ex: "GAS"
    categoria: string                  // ex: "REVENDA-GAS-E-AGUA"
    button_component: string           // ex: "ButtonGas" (apenas string, front map para componente)
    modal_componnent: string           // Executa um Component Modal conforme informado
    link: string                       // ex: "#", ou "/minhas-compras"
    ordem: number                      // ordem de exibição
    ativo: boolean                     // visibilidade (true = mostra)
    mobile_position_x: number | null   // posição atual no mobile (px) ou null se unset
    mobile_position_y: number | null
    desktop_position_x: number | null  // posição atual no desktop (px) ou null se unset
    desktop_position_y: number | null
    criado_em?: string | Date          // ISO string ou Date
    atualizado_em?: string | Date      // ISO string ou Date
}

export const menuPrincipalValues: TMenuPrincipal = {
    nome: '',
    categoria: '',
    button_component: '',
    modal_componnent: '',
    link: '#',
    ordem: 0,
    ativo: true,
    mobile_position_x: 0,
    mobile_position_y: 0,
    desktop_position_x: 0,
    desktop_position_y: 0,
    criado_em: new Date(),
    atualizado_em: new Date()
}
