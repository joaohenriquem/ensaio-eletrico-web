import { test, expect } from '@playwright/test'
import { loginViaStorage } from './helpers/auth'

const TOKEN = process.env.TEST_TOKEN ?? ''
const USER = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')

test.describe('Propostas Comerciais', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page, TOKEN, USER)
    await page.goto('/propostas')
  })

  test('exibe página de propostas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Propostas Comerciais' })).toBeVisible()
  })

  test('FAB de nova proposta visível', async ({ page }) => {
    await expect(page.locator('button[title="Nova Proposta"]')).toBeVisible()
  })

  test('abre drawer de nova proposta', async ({ page }) => {
    await page.locator('button[title="Nova Proposta"]').click()
    await expect(page.getByText('Nova Proposta').first()).toBeVisible()
    await expect(page.getByText('Identificação')).toBeVisible()
  })

  test('valida campos obrigatórios', async ({ page }) => {
    await page.locator('button[title="Nova Proposta"]').click()
    await page.getByRole('button', { name: /Enviar/ }).click()
    await expect(page.getByText(/obrigatório/i)).toBeVisible()
  })

  test('filtra por status', async ({ page }) => {
    const select = page.locator('select').first()
    await select.selectOption('aprovado')
    await page.waitForTimeout(500)
  })

  test('botão PDF aparece no card expandido', async ({ page }) => {
    const cards = page.locator('.rounded-xl.border.border-gray-200')
    const count = await cards.count()
    if (count > 0) {
      await cards.first().locator('button').first().click()
      await expect(page.getByRole('button', { name: /PDF/i }).first()).toBeVisible({ timeout: 3000 })
    }
  })
})
