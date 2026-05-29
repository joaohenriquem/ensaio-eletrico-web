import { test, expect } from '@playwright/test'
import { loginViaStorage } from './helpers/auth'

const TOKEN = process.env.TEST_TOKEN ?? ''
const USER = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')

test.describe('Relatórios de Manutenção', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page, TOKEN, USER)
    await page.goto('/relatorios')
  })

  test('exibe página de relatórios', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Relatórios de Manutenção' })).toBeVisible()
  })

  test('FAB de novo relatório visível', async ({ page }) => {
    await expect(page.locator('button[title="Novo Relatório"]')).toBeVisible()
  })

  test('abre drawer de novo relatório', async ({ page }) => {
    await page.locator('button[title="Novo Relatório"]').click()
    await expect(page.getByText('Novo Relatório').first()).toBeVisible()
    await expect(page.getByText('Dados Gerais')).toBeVisible()
  })

  test('valida campos obrigatórios', async ({ page }) => {
    await page.locator('button[title="Novo Relatório"]').click()
    await page.getByRole('button', { name: /Finalizar/ }).click()
    await expect(page.getByText(/obrigatório/i)).toBeVisible()
  })

  test('painel é adicionado ao clicar em Adicionar', async ({ page }) => {
    await page.locator('button[title="Novo Relatório"]').click()
    const btnAdicionar = page.getByRole('button', { name: /Adicionar/ })
    await expect(btnAdicionar).toBeVisible()
    await btnAdicionar.click()
    await expect(page.getByText('Painel 2')).toBeVisible()
  })
})
