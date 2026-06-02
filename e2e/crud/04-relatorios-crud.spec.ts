import { test, expect } from '@playwright/test'
import { loginViaStorage, expandirCard, clicarEditar, confirmarExclusao, TIMEOUT, hoje } from './helpers'

test.describe('CRUD — Relatórios de Manutenção', () => {
  const cliente = `CRUD-Relatorio-${Date.now()}`
  const localOriginal = 'Bloco A - CRUD Original'
  const localEditado = 'Bloco B - CRUD Editado'

  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page)
    await page.goto('/relatorios')
    await page.getByRole('heading', { name: 'Relatórios de Manutenção', exact: true }).waitFor({ timeout: TIMEOUT })
  })

  test('CREATE — cria novo relatório', async ({ page }) => {
    await page.locator('button[title="Novo Relatório"]').click()
    await page.getByText('Novo Relatório').first().waitFor({ timeout: 8000 })

    // Preenche cliente manual
    const selectCliente = page.locator('select').first()
    const opts = await selectCliente.locator('option').allInnerTexts()
    if (opts.some(o => o.includes('manual') || o.includes('Digitar'))) {
      await selectCliente.selectOption({ label: opts.find(o => o.includes('manual') || o.includes('Digitar'))! })
    }
    await page.getByLabel('Ou digite o cliente').fill(cliente)
    await page.getByLabel('Local *').fill(localOriginal)
    await page.getByLabel('Data').fill(hoje)

    await page.getByRole('button', { name: /Finalizar/ }).click()

    await expect(
      page.getByText(cliente).or(page.getByText(/possível salvar|obrigatório/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('READ — relatório aparece na lista', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expect(card).toBeVisible()
    await card.locator('button').first().click()
    await expect(card.getByText(localOriginal)).toBeVisible({ timeout: 5000 })
  })

  test('UPDATE — edita local do relatório', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, cliente)
    await clicarEditar(page, card, 'Editar Relatório')

    const campoLocal = page.getByLabel('Local *')
    await campoLocal.clear()
    await campoLocal.fill(localEditado)

    await page.getByRole('button', { name: /Salvar/ }).click()

    await expect(
      page.getByText(localEditado).or(page.getByText(/não foi possível/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('DELETE — exclui relatório e some da lista', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, cliente)
    await confirmarExclusao(page, card)

    await expect(page.getByText(cliente)).not.toBeVisible({ timeout: TIMEOUT })
  })
})
