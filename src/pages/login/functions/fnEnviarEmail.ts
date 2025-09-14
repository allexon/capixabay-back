//src/login/sockets/functions/fnEnviarEmail.ts
import nodemailer from 'nodemailer'
import { ENV } from '@/config/env-config'

type TProps = {
    email_acesso?: string | null
    codigo_acesso?: string | null
}

export const fnEnviarEmail = async (props: TProps): Promise<true | false> => {
    console.log(`📧 Usando configurações de email de ${process.env.NODE_ENV === 'production' ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`)

    const email = props.email_acesso?.trim() || null
    const codigo = props.codigo_acesso?.trim() || null

    if (!email || !codigo) {
        console.log('❌ Email ou código de acesso inválidos.', email, codigo)
        return false
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: ENV.ZOHO_EMAIL,
            pass: ENV.ZOHO_PASSWORD
        },
        tls: { rejectUnauthorized: false }
    })

    try {
        const _res = await transporter.sendMail({
            from: `"Capixabay" <${ENV.ZOHO_EMAIL}>`,
            to: email,
            subject: 'Capixabay - Seu Código de Acesso',
            text: `Seu código Capixabay é: ${codigo}.`,
            html: `
        <div style="font-family: Arial, sans-serif; text-align: center; background: #f9f9f9; padding: 20px;">
          <h2>Bem-vindo(a) à Capixabay!</h2>
          <p>Seu código de acesso:</p>
          <div style="font-size: 32px; color: #45BD3F; font-weight: bold; padding: 10px;">
            ${codigo}
          </div>
          <p>Se você não solicitou este código, ignore este e-mail.</p>
        </div>
      `
        })
        if (_res) {
            return true
        } else {
            return false
        }
    } catch (error) {        
        return false
    }
}
