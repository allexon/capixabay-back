// src/sockets/requisicao.ts
export interface IPropsRequisicaoIO<T = any> {
  data?: T | T[] | null
}

const states = {
  data: null
}

export const fnStatesRequisicaoIO = <T>(props: IPropsRequisicaoIO<T>): { data: T | T[] | null } => {
  return {...states, data: props.data ?? null}
}

/*
  // Retorno padrão default:
  { data: null }

  // Exemplos de uso:
  fnStatesRequisicaoIO({}) // { data: null }
  fnStatesRequisicaoIO({ data: { email: 'teste@example.com', codigo: '123456' } }) // { data: { email: 'teste@example.com', codigo: '123456' } }
  fnStatesRequisicaoIO({ data: [{ email: 'teste@example.com', codigo: '123456' }] }) // { data: [{ email: 'teste@example.com', codigo: '123456' }] }
*/