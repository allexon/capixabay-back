export type THTTPRoute = {
    uri: string
    local: string
    fn: string
    method?: 'GET' | 'POST'
}

const pathHTTP: THTTPRoute[] = [
    {
        uri: 'lista-pedidos-enviados-aceitos',
        local: '@/pages/pedido/http/fnHttpListaPedidosEnviadosAceitos',
        fn: 'fnHttpListaPedidosEnviadosAceitos',
        method: 'POST',
    }    
]

export const PATH_HTTP = pathHTTP
