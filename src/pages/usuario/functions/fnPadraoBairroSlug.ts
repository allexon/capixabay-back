//src/sockets/usuario/functions/fnPadraoBairroSlug.ts
export const fnPadraoBairroSlug = (bairro: string = '', municipio: string = '', estado: string = ''): string => {
    const normalizar = (texto: string) =>
        texto
            .normalize('NFD')                 // separa os acentos das letras
            .replace(/[\u0300-\u036f]/g, '') // remove os acentos
            .toUpperCase()                   // tudo em maiúsculo
            .replace(/\s+/g, '-')            // espaços viram traços
            .replace(/[^A-Z0-9-]/g, '')      // remove caracteres especiais
            .replace(/-+/g, '-')             // evita traços duplicados
            .replace(/^-|-$|/g, '')          // remove traços no início/fim

    return `${normalizar(bairro)}-${normalizar(municipio)}-${normalizar(estado)}`
}