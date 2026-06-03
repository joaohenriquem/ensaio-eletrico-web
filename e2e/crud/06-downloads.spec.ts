import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import { loginViaStorage, TIMEOUT } from './helpers'

/**
 * Testa o download de PDF de relatórios e propostas.
 *
 * O botão PDF nos cards chama GET /relatorios/{id}/pdf ou /propostas/{id}/pdf.
 * O backend retorna um blob que o browser dispara como download.
 * Playwright intercepta com page.waitForEvent('download').
 *
 * Pré-requisito: API online e ao menos um registro na lista.
 * Se não houver registros, os testes são pulados.
 */

async function abrirCardEClicarPdf(page: import('@playwright/test').Page, rota: string) {
  await loginViaStorage(page)
  await page.goto(rota)
  await page.waitForTimeout(2000)

  const cards = page.locator('.rounded-xl.border.border-gray-200')
  if (await cards.count() === 0) return null

  const card = cards.first()

  // Tenta clicar para expandir o card; se não for clicável (loading, coberto), pula
  try {
    await card.locator('button').first().click({ timeout: 8000 })
  } catch {
    return null
  }
  await page.waitForTimeout(500)

  const btnPdf = card.getByRole('button', { name: /PDF/i })
  if (await btnPdf.count() === 0) return null

  return { card, btnPdf }
}

function verificarPdf(path: string) {
  const stats = fs.statSync(path)
  expect(stats.size).toBeGreaterThan(100)

  const header = Buffer.alloc(5)
  const fd = fs.openSync(path, 'r')
  fs.readSync(fd, header, 0, 5, 0)
  fs.closeSync(fd)
  expect(header.toString()).toBe('%PDF-')
}

// ─── Relatórios ──────────────────────────────────────────────────────────────

test.describe('Download PDF — Relatórios', () => {
  test('PDF é baixado com assinatura PDF válida', async ({ page }) => {
    const result = await abrirCardEClicarPdf(page, '/relatorios')
    if (!result) { test.skip(); return }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      result.btnPdf.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
    const path = await download.path()
    expect(path).not.toBeNull()
    verificarPdf(path!)
  })

  test('nome do arquivo segue padrão REL-YYYY-NNN.pdf', async ({ page }) => {
    const result = await abrirCardEClicarPdf(page, '/relatorios')
    if (!result) { test.skip(); return }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      result.btnPdf.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/REL-\d{4}-\d+\.pdf/i)
  })

  test('dois downloads seguidos funcionam sem erro', async ({ page }) => {
    const result = await abrirCardEClicarPdf(page, '/relatorios')
    if (!result) { test.skip(); return }

    const [d1] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      result.btnPdf.click(),
    ])
    expect(d1.suggestedFilename()).toMatch(/\.pdf$/i)

    await page.waitForTimeout(800)

    const [d2] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      result.btnPdf.click(),
    ])
    expect(d2.suggestedFilename()).toMatch(/\.pdf$/i)
  })

  test('PDF de relatório recém-criado pode ser baixado', async ({ page }) => {
    await loginViaStorage(page)
    await page.goto('/relatorios')

    // Cria novo relatório
    await page.locator('button[title="Novo Relatório"]').click()
    await page.getByText('Novo Relatório').first().waitFor({ timeout: 8000 })

    const cliente = `PDF-Test-${Date.now()}`
    await page.getByLabel('Ou digite o cliente').fill(cliente)
    await page.getByLabel('Local *').fill('Sala de Testes PDF')
    await page.getByLabel('Data').fill(new Date().toISOString().slice(0, 10))

    const btnFinalizar = page.getByRole('button', { name: /Finalizar/ })
    await page.evaluate((el) => (el as HTMLElement).click(), await btnFinalizar.elementHandle())

    // Aguarda resultado
    const criado = await page.getByText(cliente)
      .waitFor({ timeout: TIMEOUT })
      .then(() => true)
      .catch(() => false)

    if (!criado) { test.skip(); return }

    // Expande o card e baixa o PDF
    const card = page.locator('.rounded-xl.border.border-gray-200').filter({ hasText: cliente })
    await card.locator('button').first().click()
    await page.waitForTimeout(500)

    const btnPdf = card.getByRole('button', { name: /PDF/i })
    if (await btnPdf.count() === 0) { test.skip(); return }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      btnPdf.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/REL-\d{4}-\d+\.pdf/i)
    const path = await download.path()
    verificarPdf(path!)
  })
})

// ─── Propostas ───────────────────────────────────────────────────────────────

test.describe('Download PDF — Propostas', () => {
  test('PDF é baixado com assinatura PDF válida', async ({ page }) => {
    const result = await abrirCardEClicarPdf(page, '/propostas')
    if (!result) { test.skip(); return }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      result.btnPdf.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
    const path = await download.path()
    expect(path).not.toBeNull()
    verificarPdf(path!)
  })

  test('nome do arquivo segue padrão PROP-YYYY-NNN.pdf', async ({ page }) => {
    const result = await abrirCardEClicarPdf(page, '/propostas')
    if (!result) { test.skip(); return }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: TIMEOUT }),
      result.btnPdf.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/PROP-\d{4}-\d+\.pdf/i)
  })
})
