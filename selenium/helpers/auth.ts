import { WebDriver } from 'selenium-webdriver'
import axios from 'axios'
import { BASE_URL } from './driver'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'

export const TOKEN = process.env.TEST_TOKEN ?? ''
export const USER_JSON = process.env.TEST_USER_JSON
  ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}'

export const ADMIN_USER = JSON.parse(USER_JSON)
export const TECNICO_USER = { ...ADMIN_USER, perfil: 'Técnico' }

/**
 * Injeta token e usuário no localStorage e navega para a home,
 * simulando um login sem passar pelo fluxo de OTP.
 */
export async function loginViaStorage(driver: WebDriver, user = ADMIN_USER): Promise<void> {
  await driver.get(`${BASE_URL}/login`)
  await driver.executeScript(`
    localStorage.setItem('token', ${JSON.stringify(TOKEN)});
    localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))});
  `)
  await driver.get(`${BASE_URL}/`)
}

export async function logout(driver: WebDriver): Promise<void> {
  await driver.executeScript(`
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lembrar');
  `)
}

/** Remove registros de teste cujo campo começa com o prefixo dado. */
export async function limparRegistrosTeste(
  rota: string,
  campo: string,
  prefixo: string,
): Promise<void> {
  if (!TOKEN) return
  const headers = { Authorization: `Bearer ${TOKEN}` }
  try {
    const res = await axios.get<Record<string, unknown>[]>(`${API_URL}/api/${rota}`, { headers })
    for (const item of res.data) {
      if (String(item[campo] ?? '').startsWith(prefixo)) {
        await axios.delete(`${API_URL}/api/${rota}/${item._id}`, { headers }).catch(() => {})
      }
    }
  } catch { /* API offline — ignora */ }
}
