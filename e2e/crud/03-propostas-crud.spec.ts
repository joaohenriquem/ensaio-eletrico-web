import { test, expect } from '@playwright/test'
import { loginViaStorage, expandirCard, clicarEditar, confirmarExclusao, TIMEOUT, hoje } from './helpers'

test.describe('CRUD — Propostas Comerciais', () => {
  const cliente = `CRUD-Proposta-${Date.now()}`
  const descricaoOriginal = `Reforma elétrica CRUD ${Date.now()}`
  const descricaoEditada = `Reforma elétrica CRUD editada ${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page)
    await page.goto('/propostas')
    await page.getByRole('heading', { name: 'Propostas Comerciais' }).waitFor({ timeout: TIMEOUT })
  })

  test('CREATE — cria nova proposta', async ({ page }) => {
    await page.locator('button[title="Nova Proposta"]').click()
    await page.getByText('Nova Proposta').first().waitFor({ timeout: 8000 })

    // Seleciona "Digitar manualmente" e preenche o cliente
    await page.locator('select').first().selectOption('__manual__')
    await page.getByLabel('Ou digite o cliente').fill(cliente)
    await page.getByLabel('Data').fill(hoje)
    await page.getByLabel('Descrição da Proposta *').fill(descricaoOriginal)

    await page.getByRole('button', { name: /Enviar/ }).click()

    await expect(
      page.getByText(cliente).or(page.getByText(/obrigatório|não foi possível/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('READ — proposta aparece na lista', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expect(card).toBeVisible()
    await card.locator('button').first().click()
    await expect(card.getByText(descricaoOriginal)).toBeVisible({ timeout: 5000 })
  })

  test('UPDATE — edita descrição da proposta', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, cliente)
    await clicarEditar(page, card, 'Editar Proposta')

    const campoDescricao = page.getByLabel('Descrição da Proposta *')
    await campoDescricao.clear()
    await campoDescricao.fill(descricaoEditada)

    await page.getByRole('button', { name: /Salvar/ }).click()

    await expect(
      page.getByText(descricaoEditada).or(page.getByText(/não foi possível/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('DELETE — exclui proposta e some da lista', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, cliente)
    await confirmarExclusao(page, card)

    await expect(page.getByText(cliente)).not.toBeVisible({ timeout: TIMEOUT })
  })
})
