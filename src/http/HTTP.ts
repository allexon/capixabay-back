export type THTTPRoute = {
    uri: string
    local: string
    fn: string
    method?: 'GET' | 'POST'
  }

  const http: THTTPRoute[] = [    
    { uri: 'lista-pedidos-enviados-aceitos', local: '@/http/fnHttpListaPedidosEnviadosAceitos', fn: 'fnHttpListaPedidosEnviadosAceitos',  method: 'POST'  }
  ]

  export const HTTP = http
