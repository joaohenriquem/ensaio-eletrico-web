import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('exibe tela de login corretamente', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Usuário')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()
    await expect(page.getByText('Esqueci minha senha')).toBeVisible()
    await expect(page.getByText('Solicitar cadastro')).toBeVisible()
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Usuário').fill('usuario_invalido')
    await page.getByLabel('Senha').fill('senha_errada')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByText(/inválido|incorreto|erro/i)).toBeVisible({ timeout: 10000 })
  })

  test('redireciona para login sem autenticação', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/login/)
  })

  test('redireciona para login sem autenticação ao acessar clientes', async ({ page }) => {
    await page.goto('/clientes')
    await expect(page).toHaveURL(/login/)
  })

  test('mostra passo de OTP após credenciais válidas', async ({ page }) => {
    test.skip(!process.env.TEST_USER || !process.env.TEST_PASS, 'Requer TEST_USER e TEST_PASS com credenciais reais do sistema')
    await page.goto('/login')
    await page.getByLabel('Usuário').fill(process.env.TEST_USER!)
    await page.getByLabel('Senha').fill(process.env.TEST_PASS!)
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByText(/código/i)).toBeVisible({ timeout: 10000 })
  })

  test('exibe aviso de sistema offline no horário correto', async ({ page }) => {
    await page.goto('/login')
    const now = new Date()
    const brtMinutes = ((now.getUTCHours() * 60 + now.getUTCMinutes()) - 3 * 60 + 1440) % 1440
    const isOffline = brtMinutes >= 22 * 60 + 30 || brtMinutes < 8 * 60 + 30
    if (isOffline) {
      await expect(page.getByText(/offline/i)).toBeVisible()
    }
  })
})
