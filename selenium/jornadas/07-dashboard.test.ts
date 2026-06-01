import { describe, it, before, after, beforeEach } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, BASE_URL, By, TIMEOUT } from '../helpers/driver'
import { loginViaStorage } from '../helpers/auth'

describe('Jornada: Dashboard', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => { await encerrarDriver(driver) })
  beforeEach(async () => {
    await loginViaStorage(driver)
    await driver.get(`${BASE_URL}/dashboard`)
    await aguardar(driver, By.xpath(`//h1[contains(., 'Dashboard')]`))
  })

  it('exibe título Dashboard', async () => {
    const titulo = await driver.findElement(By.xpath(`//h1[contains(., 'Dashboard')]`))
    expect(await titulo.isDisplayed()).to.be.true
  })

  it('exibe cards de estatísticas (OS, Clientes, Relatórios ou Propostas)', async () => {
    await driver.wait(async () => {
      const cards = await driver.findElements(
        By.xpath(`//*[contains(., 'OS Abertas') or contains(., 'Clientes Ativos') or contains(., 'Total Relatórios')]`)
      )
      return cards.length > 0
    }, TIMEOUT)

    const card = await driver.findElement(
      By.xpath(`//*[contains(., 'OS Abertas') or contains(., 'Clientes Ativos') or contains(., 'Total Relatórios')]`)
    )
    expect(await card.isDisplayed()).to.be.true
  })

  it('exibe seção de Últimas Ordens de Serviço', async () => {
    const secao = await aguardar(driver, By.xpath(`//*[contains(., 'Últimas') and contains(., 'Ordens')]`))
    expect(await secao.isDisplayed()).to.be.true
  })

  it('exibe seção de Ordens de Serviço por Status', async () => {
    const secao = await aguardar(driver, By.xpath(`//*[contains(., 'Ordens de Serviço por Status')]`))
    expect(await secao.isDisplayed()).to.be.true
  })

  it('exibe seção de Propostas por Status', async () => {
    const secao = await aguardar(driver, By.xpath(`//*[contains(., 'Propostas por Status')]`))
    expect(await secao.isDisplayed()).to.be.true
  })

  it('navegação pelo menu lateral funciona', async () => {
    const linkClientes = await aguardar(driver, By.xpath(`//a[@href='/clientes' or @href='/clientes/']`))
    await linkClientes.click()

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl()
      return url.includes('/clientes')
    }, TIMEOUT)

    const url = await driver.getCurrentUrl()
    expect(url).to.include('/clientes')
  })
})
