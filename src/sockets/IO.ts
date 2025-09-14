export interface IProps {
    canal: string
    local: string
    fn: string
    categoria?: string
}

const canais: IProps[] = [
    
    // SOCKET
    { canal: 'SOCKET_ID', local: '@/pages/socket-controle', fn: 'SocketIdControle' },

    // LOGIN
    { canal: 'AUTORIZACAO', local: '@/pages/login/Login', fn: 'Login' },

    // USUARIOS
    { canal: 'USUARIO', local: '@/pages/usuario/Usuario', fn: 'Usuario' },
    { canal: 'USUARIO_MEUS_DADOS', local: '@/pages/usuario/UsuarioMeusDados', fn: 'UsuarioMeusDados'},
    { canal: 'USUARIO_CORRENTE', local: '@/pages/usuario/UsuarioCorrente', fn: 'UsuarioCorrente' },
    
    // EMPRESAS
    { canal: 'LOGOUT', local: '@/pages/empresa/Logout', fn: 'Logout' },
    { canal: 'EMPRESA_OPEN', local: '@/pages/empresa/EmpresaOpen', fn: 'EmpresaOpen' },
    { canal: 'EMPRESA_CLOSE', local: '@/pages/empresa/EmpresaClose', fn: 'EmpresaClose' },

    // REVENDA GÁS E ÁGUA    
    { canal: 'MENOR_PRECO_AGUA', local: '@/pages/revenda-gas-agua/MenorPrecoAgua', fn: 'MenorPrecoAgua'},
    { canal: 'MENOR_PRECO_GAS', local: '@/pages/revenda-gas-agua/MenorPrecoGas', fn: 'MenorPrecoGas'},
    { canal: 'EMPRESA_GET_PRECO_GAS_AGUA', local: '@/pages/revenda-gas-agua/EmpresaGetPrecoGasAgua', fn: 'EmpresaGetPrecoGasAgua'},
    { canal: 'EMPRESA_UPDATE_PRECO_GAS_AGUA', local: '@/pages/revenda-gas-agua/EmpresaUpdatePrecoGasAgua', fn: 'EmpresaUpdatePrecoGasAgua'},
    
    // PEDIDO
    { canal:'PEDIDO_NOVO', local: '@/pages/pedido/PedidoNovo', fn: 'PedidoNovo'},
    { canal:'PEDIDO_MUDAR_STATUS', local: '@/pages/pedido/PedidoMudarStatus', fn: 'PedidoMudarStatus'},
    { canal:'LISTA_PEDIDOS_ENVIADOS_ACEITOS', local: '@/pages/pedido/ListaPedidosEnviadosAceitos', fn: 'ListaPedidosEnviadosAceitos'},

    // MENU PRINCIPAL
    { canal:'MENU_PRINCIPAL', local: '@/pages/menu-principal/MenuPrincipal', fn: 'MenuPrincipal'}
]

export const rotasDinamicasIO = canais

// 🔹 Fonte única de verdade para emissão e listeners
export const IO = Object.fromEntries(
    canais.map(item => [
        item.canal, // já usamos underscore no nome do canal
        item.canal
    ])
) as Record<typeof canais[number]['canal'], string>
