import { test, expect } from '@playwright/test'
import { loginViaStorage } from './helpers/auth'

const TOKEN = process.env.TEST_TOKEN ?? ''
const USER = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page, TOKEN, USER)
    await page.goto('/dashboard')
  })

  test('exibe cards de estatísticas', async ({ page }) => {
    await expect(page.getByText(/OS Abertas|Clientes|Relatórios|Propostas/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('exibe OS recentes', async ({ page }) => {
    await expect(page.getByText(/OS Recentes|Ordens Recentes/i)).toBeVisible({ timeout: 10000 })
  })
})
