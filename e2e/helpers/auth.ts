import type { Page } from '@playwright/test'

export const ADMIN = {
  username: process.env.TEST_USER ?? 'admin',
  password: process.env.TEST_PASS ?? 'admin123',
}

/**
 * Faz login completo via API (bypassa OTP no ambiente de teste)
 * Injeta token e user direto no localStorage.
 */
export async function loginViaStorage(page: Page, token: string, user: object) {
  await page.goto('/')
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { token, user })
  await page.goto('/')
}

/**
 * Faz login pela UI (requer OTP — use apenas em testes manuais ou com mock).
 */
export async function loginViaUI(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Usuário').fill(username)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Continuar' }).click()
}

export async function logout(page: Page) {
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  })
}
