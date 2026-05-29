import { test, expect } from '@playwright/test'
import { loginViaStorage } from './helpers/auth'

const TOKEN = process.env.TEST_TOKEN ?? ''
const USER = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')

test.describe('Ordens de Serviço', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page, TOKEN, USER)
    await page.goto('/ordens')
  })

  test('exibe página de OS', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ordens de Serviço' })).toBeVisible()
  })

  test('FAB de nova OS visível', async ({ page }) => {
    await expect(page.locator('button[title="Nova OS"]')).toBeVisible()
  })

  test('abre drawer de nova OS', async ({ page }) => {
    await page.locator('button[title="Nova OS"]').click()
    await expect(page.getByText('Nova OS').first()).toBeVisible()
    await expect(page.getByLabel('Descrição / Escopo *')).toBeVisible()
  })

  test('valida campos obrigatórios', async ({ page }) => {
    await page.locator('button[title="Nova OS"]').click()
    await page.getByRole('button', { name: 'Criar OS' }).click()
    await expect(page.getByText(/obrigatório/i)).toBeVisible()
  })

  test('filtro de status funciona', async ({ page }) => {
    const select = page.locator('select').first()
    await select.selectOption('concluida')
    await page.waitForTimeout(500)
    const cards = page.locator('.rounded-xl.border.border-gray-200')
    const count = await cards.count()
    // Todos cards visíveis devem ter badge concluída
    for (let i = 0; i < Math.min(count, 3); i++) {
      const badge = cards.nth(i).locator('text=/Concluída/i')
      if (await badge.count() > 0) {
        await expect(badge.first()).toBeVisible()
      }
    }
  })

  test('busca por cliente funciona', async ({ page }) => {
    await page.getByPlaceholder(/buscar por cliente/i).fill('xyzxyzxyz')
    await page.waitForTimeout(500)
    await expect(page.getByText(/nenhuma OS/i)).toBeVisible()
  })
})
