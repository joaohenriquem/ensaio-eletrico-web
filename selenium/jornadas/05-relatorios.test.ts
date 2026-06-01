import { describe, it, before, after, beforeEach } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, BASE_URL, By } from '../helpers/driver'
import { loginViaStorage } from '../helpers/auth'

describe('Jornada: Relatórios de Manutenção', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => { await encerrarDriver(driver) })
  beforeEach(async () => {
    await loginViaStorage(driver)
    await driver.get(`${BASE_URL}/relatorios`)
    await aguardar(driver, By.xpath(`//h1[contains(., 'Relatório')]`))
  })

  it('exibe título da página', async () => {
    const titulo = await driver.findElement(By.xpath(`//h1[contains(., 'Relatório')]`))
    expect(await titulo.isDisplayed()).to.be.true
  })

  it('FAB de novo relatório está visível', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Relatório"]`))
    expect(await fab.isDisplayed()).to.be.true
  })

  it('abre drawer com seção Dados Gerais', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Relatório"]`))
    await fab.click()

    const tituloDrawer = await aguardar(driver, By.xpath(`//h2[contains(., 'Novo Relatório')]`))
    expect(await tituloDrawer.isDisplayed()).to.be.true

    const secao = await aguardar(driver, By.xpath(`//*[contains(., 'Dados Gerais')]`))
    expect(await secao.isDisplayed()).to.be.true
  })

  it('valida campos obrigatórios ao finalizar sem preencher', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Relatório"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//button[contains(., 'Finalizar')]`))
    const btnFinalizar = await driver.findElement(By.xpath(`//button[contains(., 'Finalizar')]`))
    await driver.executeScript('arguments[0].scrollIntoView(true); arguments[0].click()', btnFinalizar)

    const erro = await aguardar(driver, By.xpath(`//*[contains(., 'obrigatório')]`))
    expect(await erro.isDisplayed()).to.be.true
  })

  it('adiciona painel ao clicar em Adicionar', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Relatório"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//h2[contains(., 'Novo Relatório')]`))

    const btnAdicionar = await aguardar(driver, By.xpath(`//button[contains(., 'Adicionar')]`))
    await btnAdicionar.click()

    const painel2 = await aguardar(driver, By.xpath(`//*[contains(., 'Painel 2')]`))
    expect(await painel2.isDisplayed()).to.be.true
  })

  it('drawer contém checklist de inspeção visual', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Relatório"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//h2[contains(., 'Novo Relatório')]`))

    const elementos = await driver.findElements(By.xpath(`//*[contains(., 'Inspeção Visual') or contains(., 'Limpeza')]`))
    expect(elementos.length).to.be.greaterThan(0)
  })
})
