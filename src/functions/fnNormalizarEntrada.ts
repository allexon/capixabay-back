import { ObjectId } from 'mongodb'

export const fnNormalizarEntrada  = (entrada: any, opcoes?: { transformarId?: boolean }): any[] => {
  if (!entrada) return []

  const dados = Array.isArray(entrada) ? entrada : [entrada]

  const normalizados = dados
    .filter(obj => typeof obj === 'object' && obj !== null)
    .map(obj => {
      if (!opcoes?.transformarId) return obj

      // Transforma campos *_id em ObjectId se for string válida
      const novo: Record<string, any> = {}
      for (const key in obj) {
        const val = obj[key]
        if (key.endsWith('_id') && typeof val === 'string' && /^[a-f\d]{24}$/i.test(val)) {
          novo[key] = new ObjectId(val)
        } else {
          novo[key] = val
        }
      }
      return novo
    })

  return normalizados
}
