import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, findByLabel, BASE_URL, By, TIMEOUT } from '../helpers/driver'
import { loginViaStorage, ADMIN_USER, TECNICO_USER } from '../helpers/auth'

describe('Jornada: Gestão de Usuários', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => { await encerrarDriver(driver) })

  it('administrador acessa página de usuários', async () => {
    await loginViaStorage(driver, ADMIN_USER)
    await driver.get(`${BASE_URL}/usuarios`)

    const titulo = await aguardar(driver, By.xpath(`//h1[contains(., 'Usuários')]`))
    expect(await titulo.isDisplayed()).to.be.true
  })

  it('técnico é redirecionado ao acessar /usuarios', async () => {
    await loginViaStorage(driver, TECNICO_USER)
    await driver.get(`${BASE_URL}/usuarios`)

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl()
      return !url.includes('/usuarios')
    }, TIMEOUT)

    const url = await driver.getCurrentUrl()
    expect(url).to.not.include('/usuarios')
  })

  it('admin vê FAB de novo usuário', async () => {
    await loginViaStorage(driver, ADMIN_USER)
    await driver.get(`${BASE_URL}/usuarios`)

    const fab = await aguardar(driver, By.css(`button[title="Novo Usuário"]`))
    expect(await fab.isDisplayed()).to.be.true
  })

  it('abre drawer de novo usuário com campo Nome', async () => {
    await loginViaStorage(driver, ADMIN_USER)
    await driver.get(`${BASE_URL}/usuarios`)

    const fab = await aguardar(driver, By.css(`button[title="Novo Usuário"]`))
    await fab.click()

    const tituloDrawer = await aguardar(driver, By.xpath(`//h2[contains(., 'Novo Usuário')]`))
    expect(await tituloDrawer.isDisplayed()).to.be.true

    const campoNome = await findByLabel(driver, 'Nome')
    expect(await campoNome.isDisplayed()).to.be.true
  })

  it('filtros de status (Pendente → Aprovado → Todos) não quebram', async () => {
    await loginViaStorage(driver, ADMIN_USER)
    await driver.get(`${BASE_URL}/usuarios`)
    await aguardar(driver, By.xpath(`//h1[contains(., 'Usuários')]`))

    for (const filtro of ['Pendente', 'Aprovado', 'Todos']) {
      const btn = await aguardar(driver, By.xpath(`//button[contains(., '${filtro}')]`))
      await btn.click()
      await driver.sleep(300)
    }

    const url = await driver.getCurrentUrl()
    expect(url).to.include('/usuarios')
  })

  it('seção de histórico de logins está visível', async () => {
    await loginViaStorage(driver, ADMIN_USER)
    await driver.get(`${BASE_URL}/usuarios`)

    const historico = await aguardar(driver, By.xpath(`//*[contains(., 'Histórico de Logins')]`))
    expect(await historico.isDisplayed()).to.be.true
  })
})
