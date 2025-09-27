// src/sockets/resposta-io.ts
type TStatus = 'ok' | 'att' | 'error'

export type TResposta = {
  slug: string | null
  status: TStatus
  comando: string | null
  message: string | null
}

export const repostasIO: TResposta[] = [
  // ******************** AUTORIZAÇÃO ********************
  { slug: 'AUTORIZACAO-REQ-INVALIDA', status: 'error', comando: null, message: 'Requisição inválida. Verifique os dados enviados.' },
  { slug: 'AUTORIZACAO-ACESSO-PERMITIDO', status: 'ok', comando: 'AUTORIZACAO-ACESSO-PERMITIDO', message: 'Bem-Vindo de volta!!!!' },
  { slug: 'AUTORIZACAO-INFORME-CODIGO-ACESSO', status: 'ok', comando: 'AUTORIZACAO-INFORME-CODIGO-ACESSO', message: 'email envado com sucesso, informe o código de acesso' },
  { slug: 'AUTORIZACAO-INFORME-CODIGO-ACESSO-NOVO-USUARIO', status: 'ok', comando: 'AUTORIZACAO-INFORME-CODIGO-ACESSO-NOVO-USUARIO', message: 'email enviado com sucesso, informe o código de acesso para o novo usuario!' },
  { slug: 'AUTORIZACAO-CODIGO-ACESSO-INVALIDO', status: 'att', comando: null, message: 'Não foi possivel validar o codigo de acesso, verifique novamente!' },
  { slug: 'AUTORIZACAO-TENTAR-NOVAMENTE', status: 'att', comando: null, message: 'Não foi possivel o acesso, espere um pouco e tente novamente!' },
  { slug: 'AUTORIZACAO-ERROR', status: 'error', comando: null, message: 'Desculpe, ouve um falha ao tentar o acesso, espere um pouco e tente novamente!' },
  { slug: 'EMAIL-INVALIDO', status: 'att', comando: null, message: 'O e-mail de acesso é obrigatório para continuar.' },
  { slug: 'ERROR-SEM-ID', status: 'error', comando: null, message: 'ID não encontrado. Tente novamente mais tarde.' },
  { slug: 'PERFIL-DESCONHECIDO', status: 'error', comando: null, message: 'Perfil desconhecido. Acesso negado.' },
  { slug: 'LOGIN-ERRO', status: 'error', comando: null, message: 'Não foi possível realizar o login. Verifique os dados.' },
  { slug: 'LOGIN_FINALIZADO', status: 'ok', comando: null, message: 'Processo de login finalizado. Nenhuma ação tomada.' },
  { slug: 'LOGIN-SUCESSO', status: 'ok', comando: null, message: 'Login realizado com sucesso.' },
  { slug: 'A-OK', status: 'ok', comando: null, message: 'Que massa, ter você por aqui!' },
  { slug: 'A-ATT', status: 'att', comando: null, message: 'Não foi possivel fazer o cadastro, tente mais tarde!' },
  { slug: 'A-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },
  { slug: 'A-ERROR-PROCURAR', status: 'error', comando: null, message: 'Sistema instavel, tente mais tarde!' },
  { slug: 'A-ERROR-REQUISICAO', status: 'error', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },
  { slug: 'A-CODIGO-ACESSO-INVALIDO', status: 'att', comando: null, message: 'Código Inválido! confira!' },
  { slug: 'A-ERROR-INSERT', status: 'att', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },
  { slug: 'A-ATT-INSERT', status: 'att', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },
  { slug: 'A-LOGIN-OK', status: 'ok', comando: null, message: 'Seja Bem Vindo!' },
  { slug: 'A-ERROR-ENVIAR-EMAIL', status: 'error', comando: null, message: 'Desculpe, não conseguimos enviar seu emai, tente depois!' },
  { slug: 'A-CODIGO-ENVIADO', status: 'ok', comando: null, message: 'Código de acesso enviado para o e-mail.' },
  { slug: 'A-CODIGO-REENVIADO', status: 'ok', comando: null, message: 'Seu código foi reenviado, confira seu e-mail!' },
  { slug: 'A-ERRO-ENVIAR-CODIGO', status: 'error', comando: null, message: 'Desculpe, não consigo enviar código de acesso, tente depois!' },
  { slug: 'A-ERROR-ENVIAR-EMAIL', status: 'error', comando: null, message: 'Erro ao tentar enviar o código por e-mail.' },
  { slug: 'A-EMAIL-NAO-ENCOTRADO', status: 'att', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },
  { slug: 'A-EMAIL-CODIGO-CONFERE', status: 'ok', comando: null, message: 'Seja bem vindo, de volta!!!!' },
  { slug: 'A-ERROR-VALIDAR-CODIGO-ACESSO', status: 'att', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },
  { slug: 'A-NAO-CONSEGUIU-UPDATE', status: 'att', comando: null, message: 'Desculpe, não foi possivel, fazer o login!' },

  // ******************** USUÁRIO ********************
  // --- USUARIO UPDATE ---
  { slug: 'USUARIO-UPDATE-OK', status: 'ok', comando: null, message: 'Dados Atualizado com Sucesso!' },
  { slug: 'USUARIO-UPDATE-ATT', status: 'att', comando: null, message: 'Desculpe, mas não foi possivel atualizar seus dados!' },
  { slug: 'USUARIO-UPDATE-ERROR', status: 'error', comando: null, message: 'Desculpe, mas não foi possivel atualizar seus dados, tente mais tarde!' },
  // --- USUARIO INSERT ---
  { slug: 'USUARIO-INSERT-OK', status: 'ok', comando: null, message: 'Cadastro efetuado com sucesso!' },
  { slug: 'USUARIO-INSERT-ATT', status: 'att', comando: null, message: 'Não foi possivel cadastrar meus dados, tente mais tarde!' },
  { slug: 'USUARIO-INSERT-ERROR', status: 'error', comando: null, message: 'Não foi possivel cadastrar meus dados, tente mais tarde!' },
  // --- USUARIO REQUSIÇÃO
  { slug: 'USUARIO-REQUISICAO-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi possivel, fazer o cadastro!' },
  { slug: 'U-ERROR-ID', status: 'error', comando: null, message: 'Não foi possivel cadastrar meus dados, tente mais tarde!' },
  { slug: 'U-OK-PROCURAR', status: 'ok', comando: null, message: 'Dados Carregado com Sucesso' },
  { slug: 'U-ATT-PROCURAR', status: 'att', comando: null, message: 'Desculpe, mas não foi possivel exibir seus dados' },
  { slug: 'U-ERROR-PROCURAR', status: 'error', comando: null, message: 'Desculpe, mas não foi possivel exibir seus dados, tente mais tarde!' },
  { slug: 'U-ERROR-PROCURAR', status: 'error', comando: null, message: 'Desculpe, mas não foi possivel atualizar seus dados, tente mais tarde!' },
  { slug: 'U-ROTA-OK', status: 'ok', comando: null, message: 'Oba!! temos empresas que atendem seu bairro!' },
  { slug: 'U-ROTA-ATT', status: 'att', comando: null, message: 'Ainda não temos empresas que atendam seu bairro!' },
  { slug: 'U-ROTA-ERROR', status: 'error', comando: null, message: 'Ainda não temos empresas que atendam seu bairro!' },

  // ******************** USUÁRIO CORRENTE ********************
  { slug: 'USUARIO-CORRENTE-OK', status: 'ok', comando: null, message: 'Dados Ok!' },
  { slug: 'USUARIO-CORRENTE-ATT', status: 'att', comando: null, message: 'Algum Problema com Dados' },
  { slug: 'USUARIO-CORRENTE-ERROR', status: 'error', comando: null, message: 'Dados Error!' },

  // ******************** SOCKET-ID ********************
  { slug: 'SOCKET-ID-OK', status: 'ok', comando: null, message: 'Socket Iniciado com Sucesso!!!' },
  { slug: 'SOCKET-ID-ERROR', status: 'error', comando: null, message: 'Socket Iniciado com Sucesso!!!' },

  // ******************** TOTALIZAÇÕES ********************
  { slug: 'TOTALIZACOES-OK', status: 'ok', comando: null, message: 'Totalizações realizada com sucesso' },
  { slug: 'TOTALIZACOES-ATT', status: 'att', comando: null, message: 'Não foi possivel realizar totalizações!' },
  { slug: 'TOTALIZACOES-ERROR', status: 'error', comando: null, message: 'Não foi possivel realizar totalizações!' },

  // ******************** REVENDA GAS E AGUA ********************
  // GET PREÇO GÁS e ÁGUA
  { slug: 'EMPRESA-GET-PRECO-GAS-AGUA-OK', status: 'ok', comando: null, message: 'Edição Preço de Gás e Água comm sucesso!' },
  { slug: 'EMPRESA-GET-PRECO-GAS-AGUA-ATT', status: 'att', comando: null, message: 'Não foi possivel buscar preço de gás e água!' },
  { slug: 'EMPRESA-GET-PRECO-GAS-AGUA-ERROR', status: 'error', comando: null, message: 'Não foi possivel buscar preço de gás e água!' },
  
  // UPDATE PREÇO GÁS e ÁGUA
  { slug: 'EMPRESA-UPDATE-PRECO-GAS-AGUA-OK', status: 'ok', comando: null, message: 'Preço de Gás e Água atualizados com sucesso!' },
  { slug: 'EMPRESA-UPDATE-PRECO-GAS-AGUA-ATT', status: 'att', comando: null, message: 'Não foi atualizar preço de gás e água!' },
  { slug: 'EMPRESA-UPDATE-PRECO-GAS-AGUA-ERROR', status: 'error', comando: null, message: 'Não foi atualizar preço de gás e água!' },

  // GAS MENOR PRECO
  { slug: 'MENOR-PRECO-GAS-OK', status: 'ok', comando: null, message: 'Gas com menor preço encontrado!' },
  { slug: 'MENOR-PRECO-GAS-ATT', status: 'att', comando: null, message: 'Não foi possivel encontrar gás com menor preço' },
  { slug: 'MENOR-PRECO-GAS-ERROR', status: 'error', comando: null, message: 'Não foi possivel encontrar gás com menor preço!' },

  // AGUA MENOR PRECO
  { slug: 'MENOR-PRECO-AGUA-OK', status: 'ok', comando: null, message: 'Água com menor preço encontrado!' },
  { slug: 'MENOR-PRECO-AGUA-ATT', status: 'att', comando: null, message: 'Não foi possivel encontrar água com menor preço' },
  { slug: 'MENOR-PRECO-AGUA-ERROR', status: 'error', comando: null, message: 'Não foi possivel encontrar água com menor preço!' },

  // ******************** PEDIDOS ********************
  // -- NOVO PEDIDO ---
  { slug: 'PEDIDO-NOVO-OK', status: 'ok', comando: null, message: 'Pedido criado com Sucesso!' },
  { slug: 'PEDIDO-NOVO-ATT', status: 'att', comando: null, message: 'Desculpe, não foi possivel enviar o pedido!' },
  { slug: 'PEDIDO-NOVO-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi possivel enviar o pedido!' },

  // -- ATUALIZAR STATUS ---
  { slug: 'PEDIDO-MUDAR-STATUS-OK', status: 'ok', comando: null, message: 'Status Pedido Atualizado com sucesso!' },
  { slug: 'PEDIDO-MUDAR-STATUS-ATT', status: 'att', comando: null, message: 'Não foi possivel atualizar status do pedido!' },
  { slug: 'PEDIDO-MUDAR-STATUS-ERROR', status: 'error', comando: null, message: 'Não foi possivel atualizar status do pedido!' },

  // -- PEDIDOS retorna objeto com dados de compra e venda dos pedidos enviados e aceitos ---
  { slug: 'LISTA-PEDIDOS-ENVIADOS-ACEITOS-OK', status: 'ok', comando: null, message: 'Pedidos carregados com sucesso!' },
  { slug: 'LISTA-PEDIDOS-ENVIADOS-ACEITOS-ATT', status: 'att', comando: null, message: 'Não foi possivel carrregarr os pedidos!' },
  { slug: 'LISTA-PEDIDOS-ENVIADOS-ACEITOS-ERROR', status: 'error', comando: null, message: 'Não foi possivel carrregarr os pedidos!' },

  // ******************** EMPRESAS ********************
  { slug: 'LOGOUT-OK', status: 'ok', comando: null, message: 'Até breve!!!!' },
  { slug: 'LOGOUT-ATT', status: 'att', comando: null, message: 'Desculpe, não foi possivel a saída!' },
  { slug: 'LOGOUT-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi possivel a saída!' },
  { slug: 'EMPRESA-OPEN-OK', status: 'ok', comando: null, message: 'Empresa aberta com sucesso!' },
  { slug: 'EMPRESA-OPEN-ATT', status: 'att', comando: null, message: 'Desculpe, não foi [ ABRIR ] empresa!' },
  { slug: 'EMPRESA-OPEN-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi [ ABRIR ] empresa!' },
  { slug: 'EMPRESA-CLOSE-OK', status: 'ok', comando: null, message: 'Empresa fechada com sucesso!' },
  { slug: 'EMPRESA-CLOSE-ATT', status: 'att', comando: null, message: 'Desculpe, não foi [ FECHAR ] empresa!' },
  { slug: 'EMPRESA-CLOSE-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi [ FECHAR ] empresa!' },

  // ******************** MENU PRINCIPAL ********************
  { slug: 'MENU-PRINCIPAL-OK', status: 'ok', comando: null, message: 'Dados do Menu Principal carreago com sucesso!' },
  { slug: 'MENU-PRINCIPAL-ATT', status: 'att', comando: null, message: 'Desculpe, não foi carregas dados do Menu Principal!' },
  { slug: 'MENU-PRINCIPAL-ERROR', status: 'error', comando: null, message: 'Desculpe, não foi carregas dados do Menu Principal!' }
]