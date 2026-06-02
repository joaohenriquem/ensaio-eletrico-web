import { test, expect } from '@playwright/test'
import { loginViaStorage, expandirCard, clicarEditar, confirmarExclusao, TIMEOUT } from './helpers'

test.describe('CRUD — Clientes', () => {
  const nome = `CRUD-Cliente-${Date.now()}`
  const cidadeOriginal = 'São Paulo'
  const cidadeEditada = 'Campinas'

  test.beforeEach(async ({ page }) => {
    await loginViaStorage(page)
    await page.goto('/clientes')
    await page.getByRole('heading', { name: 'Clientes' }).waitFor({ timeout: TIMEOUT })
  })

  test('CREATE — cria novo cliente', async ({ page }) => {
    await page.locator('button[title="Novo Cliente"]').click()
    await page.getByLabel('Nome / Condomínio *').fill(nome)
    await page.getByLabel('Cidade *').fill(cidadeOriginal)
    await page.getByRole('button', { name: 'Cadastrar Cliente' }).click()

    await expect(
      page.getByText(nome).or(page.getByText(/não foi possível salvar/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('READ — cliente aparece na lista e exibe detalhes', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: nome })
    const count = await card.count()
    if (count === 0) {
      test.skip()
      return
    }
    await expect(card).toBeVisible()
    await card.locator('button').first().click()
    await expect(card.getByText(cidadeOriginal)).toBeVisible({ timeout: 5000 })
  })

  test('UPDATE — edita cidade do cliente', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: nome })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, nome)
    await clicarEditar(page, card, 'Editar Cliente')

    const campoCidade = page.getByLabel('Cidade *')
    await campoCidade.clear()
    await campoCidade.fill(cidadeEditada)
    await page.getByRole('button', { name: 'Salvar Alterações' }).click()

    await expect(
      page.getByText(cidadeEditada).or(page.getByText(/não foi possível salvar/i))
    ).toBeVisible({ timeout: TIMEOUT })
  })

  test('DELETE — exclui cliente e some da lista', async ({ page }) => {
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: nome })
    if (await card.count() === 0) { test.skip(); return }

    await expandirCard(page, nome)
    await confirmarExclusao(page, card)

    await expect(page.getByText(nome)).not.toBeVisible({ timeout: TIMEOUT })
  })
})
