import { WebDriver } from 'selenium-webdriver'
import { BASE_URL } from './driver'

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
