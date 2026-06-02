import type { Page } from '@playwright/test'

const TOKEN = process.env.TEST_TOKEN ?? ''
const USER = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')

export async function loginViaStorage(page: Page) {
  await page.goto('/')
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }, { token: TOKEN, user: USER })
  await page.goto('/')
}

/** Expande o primeiro card da lista que contenha o texto dado */
export async function expandirCard(page: Page, texto: string) {
  const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: texto })
  await card.locator('button').first().click()
  return card
}

/** Clica Editar dentro do card expandido e aguarda o drawer */
export async function clicarEditar(page: Page, card: ReturnType<typeof page.locator>, tituloDrawer: string) {
  await card.getByRole('button', { name: 'Editar' }).click()
  await page.getByText(tituloDrawer).first().waitFor({ state: 'visible', timeout: 8000 })
}

/** Clica Excluir dentro do card e confirma no ConfirmDialog */
export async function confirmarExclusao(page: Page, card: ReturnType<typeof page.locator>) {
  await card.getByRole('button', { name: 'Excluir' }).click()
  await page.getByText('Confirmar exclusão').waitFor({ state: 'visible', timeout: 5000 })
  await page.getByRole('button', { name: 'Excluir' }).last().click()
}

export const TIMEOUT = 15_000
export const hoje = new Date().toISOString().slice(0, 10)
