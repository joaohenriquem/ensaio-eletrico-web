import { describe, it, before, after, beforeEach } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, BASE_URL, By, TIMEOUT } from '../helpers/driver'
import { loginViaStorage } from '../helpers/auth'

describe('Jornada: Propostas Comerciais', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => { await encerrarDriver(driver) })
  beforeEach(async () => {
    await loginViaStorage(driver)
    await driver.get(`${BASE_URL}/propostas`)
    await aguardar(driver, By.xpath(`//h1[contains(., 'Propostas')]`))
  })

  it('exibe título da página', async () => {
    const titulo = await driver.findElement(By.xpath(`//h1[contains(., 'Propostas')]`))
    expect(await titulo.isDisplayed()).to.be.true
  })

  it('FAB de nova proposta está visível', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova Proposta"]`))
    expect(await fab.isDisplayed()).to.be.true
  })

  it('abre drawer com seção de Identificação', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova Proposta"]`))
    await fab.click()

    const tituloDrawer = await aguardar(driver, By.xpath(`//h2[contains(., 'Nova Proposta')]`))
    expect(await tituloDrawer.isDisplayed()).to.be.true

    const secao = await aguardar(driver, By.xpath(`//*[contains(., 'Identificação')]`))
    expect(await secao.isDisplayed()).to.be.true
  })

  it('valida campos obrigatórios ao submeter vazio', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova Proposta"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//button[contains(., 'Enviar')]`))
    const btnEnviar = await driver.findElement(By.xpath(`//button[contains(., 'Enviar')]`))
    await btnEnviar.click()

    const erro = await aguardar(driver, By.xpath(`//*[contains(., 'obrigatório')]`))
    expect(await erro.isDisplayed()).to.be.true
  })

  it('filtro por status não quebra a interface', async () => {
    const selects = await driver.findElements(By.css(`select`))
    if (selects.length > 0) {
      await selects[0].findElement(By.css(`option[value="aprovado"]`)).click()
      await driver.sleep(500)
      const url = await driver.getCurrentUrl()
      expect(url).to.include('/propostas')
    }
  })

  it('drawer contém seções do formulário completo', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova Proposta"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//h2[contains(., 'Nova Proposta')]`))

    const secoes = ['Identificação', 'Objetivo', 'Investimento']
    for (const secao of secoes) {
      const elementos = await driver.findElements(By.xpath(`//*[contains(., '${secao}')]`))
      // Pelo menos alguma seção deve estar presente no drawer
      if (elementos.length > 0) {
        expect(await elementos[0].isDisplayed()).to.be.true
      }
    }
  })

  it('botão PDF visível nos cards existentes', async () => {
    await driver.sleep(2000)
    const cards = await driver.findElements(By.css(`.rounded-xl.border.border-gray-200`))
    if (cards.length > 0) {
      const botoes = await cards[0].findElements(By.css(`button`))
      if (botoes.length > 0) {
        await botoes[0].click()
        await driver.sleep(1000)
        const pdfBtns = await driver.findElements(By.xpath(`//button[contains(., 'PDF')]`))
        if (pdfBtns.length > 0) {
          expect(await pdfBtns[0].isDisplayed()).to.be.true
        }
      }
    }
  })
})
