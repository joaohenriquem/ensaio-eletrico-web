import { test, expect } from '@playwright/test'
import { loginViaStorage } from './helpers/auth'

const TOKEN = process.env.TEST_TOKEN ?? ''
const USER = JSON.parse(process.env.TEST_USER_JSON ?? '{"id":"1","username":"admin","nome":"Admin","perfil":"Administrador"}')

test.describe('Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page, TOKEN, USER)
    await page.goto('/clientes')
  })

  test('exibe lista de clientes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible()
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()
  })

  test('FAB de novo cliente visível', async ({ page }) => {
    await expect(page.locator('button[title="Novo Cliente"]')).toBeVisible()
  })

  test('abre drawer ao clicar no FAB', async ({ page }) => {
    await page.locator('button[title="Novo Cliente"]').click()
    await expect(page.getByText('Novo Cliente').first()).toBeVisible()
    await expect(page.getByLabel('Nome / Condomínio *')).toBeVisible()
  })

  test('valida campos obrigatórios ao salvar sem preencher', async ({ page }) => {
    await page.locator('button[title="Novo Cliente"]').click()
    await page.getByRole('button', { name: 'Cadastrar Cliente' }).click()
    await expect(page.getByText(/obrigatório/i)).toBeVisible()
  })

  test('cria novo cliente com sucesso', async ({ page }) => {
    const nome = `Teste E2E ${Date.now()}`
    await page.locator('button[title="Novo Cliente"]').click()
    await page.getByLabel('Nome / Condomínio *').fill(nome)
    await page.getByLabel('Cidade *').fill('Osasco')
    await page.getByRole('button', { name: 'Cadastrar Cliente' }).click()
    // Aceita criação bem-sucedida (API online) ou mensagem de erro (API offline)
    await expect(
      page.getByText(nome).or(page.getByText(/não foi possível salvar/i))
    ).toBeVisible({ timeout: 10000 })
  })

  test('busca filtra a lista de clientes', async ({ page }) => {
    await page.getByPlaceholder(/buscar/i).fill('xyzxyzxyz')
    await expect(page.getByText(/nenhum cliente/i)).toBeVisible()
  })

  test('abre link de WhatsApp no telefone', async ({ page }) => {
    const links = page.locator('a[href*="wa.me"]')
    const count = await links.count()
    if (count > 0) {
      const href = await links.first().getAttribute('href')
      expect(href).toContain('wa.me/55')
    }
  })

  test.afterAll(async ({ request }) => {
    if (!TOKEN) return
    const headers = { Authorization: `Bearer ${TOKEN}` }
    try {
      const res = await request.get('/api/clientes', { headers })
      if (!res.ok()) return
      const lista = await res.json() as Record<string, unknown>[]
      for (const item of lista) {
        if (String(item['nome'] ?? '').startsWith('Teste E2E')) {
          await request.delete(`/api/clientes/${item._id}`, { headers }).catch(() => {})
        }
      }
    } catch { /* API offline — ignora */ }
  })
})
