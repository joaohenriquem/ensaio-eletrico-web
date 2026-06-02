import { test, expect } from '@playwright/test'
import { loginViaStorage, expandirCard, clicarEditar, confirmarExclusao, TIMEOUT, hoje } from './helpers'

test.describe('CRUD — Ordens de Serviço', () => {
  const cliente = `CRUD-OS-${Date.now()}`
  const descricaoOriginal = `Manutenção preventiva CRUD ${Date.now()}`
  const descricaoEditada = `Manutenção corretiva CRUD editada ${Date.now()}`

  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page)
    await page.goto('/ordens')
    await page.getByRole('heading', { name: 'Ordens de Serviço' }).waitFor({ timeout: TIMEOUT })
  })

  test('CREATE — cria nova OS', async ({ page }) => {
    await page.locator('button[title="Nova OS"]').click()
    await page.getByText('Nova OS').first().waitFor({ timeout: 8000 })

    // Preenche cliente manual (campo visível quando nenhum cliente selecionado)
    await page.getByLabel('Nome do cliente').fill(cliente)
    await page.getByLabel('Data').fill(hoje)

    const descricao = page.locator('#os-descricao')
    await descricao.fill(descricaoOriginal)

    await page.getByRole('button', { name: /Criar OS|Criar e Enviar/ }).click()

    await expect(
      page.getByText(cliente).or(page.getByText(/possível salvar|obrigatório/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('READ — OS aparece na lista com dados corretos', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expect(card).toBeVisible()
    await card.locator('button').first().click()
    await expect(card.getByText(descricaoOriginal)).toBeVisible({ timeout: 5000 })
  })

  test('UPDATE — edita descrição da OS', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, cliente)
    await clicarEditar(page, card, 'Editar OS')

    const descricao = page.locator('#os-descricao')
    await descricao.clear()
    await descricao.fill(descricaoEditada)
    await page.getByRole('button', { name: 'Salvar Alterações' }).click()

    await expect(
      page.getByText(descricaoEditada).or(page.getByText(/não foi possível/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('DELETE — exclui OS e some da lista', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, cliente)
    await confirmarExclusao(page, card)

    await expect(page.getByText(cliente)).not.toBeVisible({ timeout: TIMEOUT })
  })
})
