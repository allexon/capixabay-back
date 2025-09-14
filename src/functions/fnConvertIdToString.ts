// Valida um Campo, para verificar se o mesmo esta nno formato de apenas strinng
//src/functions/
import { ObjectId } from 'mongodb'

/**
 * Converte qualquer valor (ObjectId ou string) para string.
 * Se for nulo ou indefinido, retorna string vazia.
 * Nunca lança erro.
 */

export const fnConvertIdToString = (
  id: string | ObjectId | null | undefined
): string => {
  if (!id) return '' // ou opcionalmente: return 'desconhecido'

  return typeof id === 'string' ? id : String(id)
}
