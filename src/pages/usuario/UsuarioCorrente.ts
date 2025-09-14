// src/sockets/usuario/UsuarioCorrente.ts
import { Socket } from 'socket.io'
import { IO } from '@/sockets/IO'
import { ObjectId, ReadConcern, ReadPreference, WithId } from 'mongodb'
import { fnConnectDirectCollection } from '@/db/capixabay-collections'
import { TUsuarioCorrente, usuarioCorrenteStates } from '@/types/TUsuarioCorrente'
import { fnRespostaIO } from '@/sockets/fnRespostaIO'
import { TUsuario } from '@/types/TUsuario'
import { TEmpresa } from '@/types/TEmpresa'
import { TAutorizacao } from '@/types/TAutorizacao'

type TReqUsuarioCorrente = {
    autorizacao_id?: string
    data?: { autorizacao_id?: string }
}

export const UsuarioCorrente = async (req: TReqUsuarioCorrente, socket: Socket) => {

    // ✅ pega o ID de autorização de qualquer forma
    const autorizacao_id = req.autorizacao_id ?? req.data?.autorizacao_id

    if (!autorizacao_id) {
        console.warn('⚠️ ID de autorização não enviado.', autorizacao_id)
        fnRespostaIO(socket, IO.USUARIO_CORRENTE, 'USUARIO-CORRENTE-ATT')
        return
    }

    try {
        const { USUARIOS, AUTORIZACOES, EMPRESAS, ROTAS } = await fnConnectDirectCollection()

        // 🔹 converte string -> ObjectId só para buscar na coleção AUTORIZACOES
        const object_autorizacao_id = new ObjectId(autorizacao_id)

        // 🔹 busca autorização
        const opts = { readConcern: new ReadConcern('majority'), readPreference: ReadPreference.primary }
        const autorizacao: WithId<TAutorizacao> | null = await AUTORIZACOES.findOne({ _id: object_autorizacao_id } as any, opts)

        // 🔹 busca usuário e empresa usando string
        const usuario: WithId<TUsuario> | null = await USUARIOS.findOne({ autorizacao_id }, opts)
        const empresa: WithId<TEmpresa> | null = await EMPRESAS.findOne({ autorizacao_id }, opts)

        // 🔹 empresas que atendem o bairro do usuário
        let empresasAtendemBairro: WithId<TEmpresa>[] = []
        if (usuario?.bairro_slug) {
            const rota = await ROTAS.findOne({ bairros: usuario.bairro_slug }, opts)
            if (rota?.rota) {
                empresasAtendemBairro = await EMPRESAS
                    .find({ rota_slug: rota.rota, ativa: true }, opts)
                    .toArray()
            }
        }

        // 🔹 monta objeto final
        const data: TUsuarioCorrente = {
            ...usuarioCorrenteStates,
            status: true,

            autorizacao: {
                autorizacao_id: autorizacao ? String(autorizacao._id) : '',
                autorizacao_email_acesso: autorizacao?.email_acesso ?? '',
                autorizacao_numero_acesso: autorizacao?.numero_acessos ?? 0,
            },

            usuario: usuario
                ? {
                    usuario_id: usuario._id!.toString(),
                    usuario_nome: usuario.nome ?? null,
                    usuario_email_acesso: usuario.autorizacao_email_acesso ?? null,
                    usuario_avatar: usuario.avatar ?? null,
                    usuario_cep: usuario.cep ?? null,
                    usuario_logradouro: usuario.logradouro ?? null,
                    usuario_numero_endereco: usuario.numero_endereco ?? null,
                    usuario_bairro_slug: usuario.bairro_slug ?? null,
                    usuario_bairro: usuario.bairro ?? null,
                    usuario_municipio: usuario.municipio ?? null,
                    usuario_estado: usuario.estado ?? null,
                    usuario_ponto_referencia: usuario.ponto_referencia ?? null,
                    usuario_celular: usuario.celular ?? null,
                    usuario_tipo_endereco: usuario.tipo_endereco ?? null,
                    usuario_apartamento_numero: usuario.apartamento_numero ?? null,
                    usuario_edificio_nome: usuario.edificio_nome ?? null,
                    usuario_andar: usuario.andar ?? null,
                    usuario_bloco: usuario.bloco ?? null,
                    usuario_contador_pedido: usuario.contador_pedido ?? null
                }
                : usuarioCorrenteStates.usuario,

            empresa: empresa
                ? {
                    empresa_dono_id: empresa.dono_id?.toString() ?? null,
                    empresa_dono_nome: empresa.dono_nome ?? null,
                    empresa_id: empresa._id?.toString() ?? null,
                    empresa_nome_fantasia: empresa.nome_fantasia ?? null,
                    empresa_categoria: empresa.categoria?? null,
                    empresa_slug: empresa.slug ?? null,
                    empresa_avatar: empresa.avatar ?? null,
                    empresa_aberta: Boolean(empresa.aberta),
                    empresa_ativa: Boolean(empresa.ativa),
                    empresa_whatsapp: empresa.whatsapp ?? null,
                    empresa_celular: empresa.celular ?? null,
                    empresa_rota: empresa.rota_slug ?? null,

                }
                : usuarioCorrenteStates.empresa,

            empresasAtendemBairro: empresasAtendemBairro.map(res => ({
                empresa_dono_id: res.dono_id?.toString() ?? null,
                empresa_dono_nome: res.dono_nome ?? null,
                empresa_id: res._id?.toString() ?? null,
                empresa_slug: res.slug ?? null,
                empresa_nome_fantasia: res.nome_fantasia ?? null,
                empresa_ativa: Boolean(res.ativa),
                empresa_aberta: Boolean(res.aberta),
                categoria: res.categoria ?? [],
            }))
        }

        fnRespostaIO(socket, IO.USUARIO_CORRENTE, 'USUARIO-CORRENTE-OK', data)
    } catch (error) {
        console.error('❌ Erro ao montar dados do usuário corrente:', error)
        fnRespostaIO(socket, IO.USUARIO_CORRENTE, 'USUARIO-CORRENTE-ERROR')
    }
}
