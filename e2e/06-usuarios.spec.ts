import { test, expect } from '@playwright/test'
import { loginViaStorage } from './helpers/auth'

const TOKEN = process.env.TEST_TOKEN ?? ''
const ADMIN = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')
const TECNICO = { ...ADMIN, perfil: 'Técnico' }

test.describe('Usuários', () => {
  test('admin acessa página de usuários', async ({ page }) => {
    await loginViaStorage(page, TOKEN, ADMIN)
    await page.goto('/usuarios')
    await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible()
  })

  test('técnico é redirecionado ao tentar acessar usuários', async ({ page }) => {
    await loginViaStorage(page, TOKEN, TECNICO)
    await page.goto('/usuarios')
    await expect(page).not.toHaveURL(/usuarios/)
  })

  test('FAB de novo usuário visível para admin', async ({ page }) => {
    await loginViaStorage(page, TOKEN, ADMIN)
    await page.goto('/usuarios')
    await expect(page.locator('button[title="Novo Usuário"]')).toBeVisible()
  })

  test('abre drawer de novo usuário', async ({ page }) => {
    await loginViaStorage(page, TOKEN, ADMIN)
    await page.goto('/usuarios')
    await page.locator('button[title="Novo Usuário"]').click()
    await expect(page.getByText('Novo Usuário').first()).toBeVisible()
    await expect(page.getByLabel('Nome *')).toBeVisible()
  })

  test('filtros de status funcionam', async ({ page }) => {
    await loginViaStorage(page, TOKEN, ADMIN)
    await page.goto('/usuarios')
    await page.getByRole('button', { name: 'Pendente' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Aprovado' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Todos' }).click()
  })

  test('histórico de logins exibe registros', async ({ page }) => {
    await loginViaStorage(page, TOKEN, ADMIN)
    await page.goto('/usuarios')
    await expect(page.getByText('Histórico de Logins')).toBeVisible()
  })
})
