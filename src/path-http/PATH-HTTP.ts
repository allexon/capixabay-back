interface RouteConfig {
    uri: string
    local: string
    fn: string
    method?: 'GET' | 'POST'
}

export const PATH_HTTP: RouteConfig[] = [
    {
        uri: 'lista-pedidos-enviados-aceitos',
        local: '@/path-http/fnHttpListaPedidosEnviadosAceitos',
        fn: 'fnHttpListaPedidosEnviadosAceitos',
        method: 'POST'
    }
]
