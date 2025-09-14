export function fnDataRequire<T extends object = any>(input: T | T[]): T {
  if (Array.isArray(input)) {
    return input[0] ?? {} as T
  }

  if (typeof input === 'object' && input !== null) {
    return input
  }

  return {} as T
}