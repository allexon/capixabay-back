export const fnValidarEmail = (email: string | null) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !!email && regex.test(email)
}
