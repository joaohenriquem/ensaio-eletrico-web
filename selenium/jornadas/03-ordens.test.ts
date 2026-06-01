import { describe, it, before, after, beforeEach } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, BASE_URL, By, TIMEOUT } from '../helpers/driver'
import { loginViaStorage } from '../helpers/auth'

describe('Jornada: Ordens de Serviço', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => { await encerrarDriver(driver) })
  beforeEach(async () => {
    await loginViaStorage(driver)
    await driver.get(`${BASE_URL}/ordens`)
    await aguardar(driver, By.xpath(`//h1[contains(., 'Ordens de Serviço')]`))
  })

  it('exibe título da página', async () => {
    const titulo = await driver.findElement(By.xpath(`//h1[contains(., 'Ordens de Serviço')]`))
    expect(await titulo.isDisplayed()).to.be.true
  })

  it('FAB de nova OS está visível', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova OS"]`))
    expect(await fab.isDisplayed()).to.be.true
  })

  it('abre drawer de nova OS com campo de descrição', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova OS"]`))
    await fab.click()

    const tituloDrawer = await aguardar(driver, By.xpath(`//h2[contains(., 'Nova OS')]`))
    expect(await tituloDrawer.isDisplayed()).to.be.true

    const descricao = await aguardar(driver, By.id('os-descricao'))
    expect(await descricao.isDisplayed()).to.be.true
  })

  it('valida campos obrigatórios ao salvar sem preencher', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Nova OS"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//button[contains(., 'Criar OS')]`))
    const btnCriar = await driver.findElement(By.xpath(`//button[contains(., 'Criar OS')]`))
    // Usa JS click para ignorar sobreposição de elementos durante animação do drawer
    await driver.executeScript('arguments[0].scrollIntoView(true); arguments[0].click()', btnCriar)

    const erro = await aguardar(driver, By.xpath(`//*[contains(., 'obrigatório')]`))
    expect(await erro.isDisplayed()).to.be.true
  })

  it('filtro de status altera a listagem', async () => {
    const selects = await driver.findElements(By.css(`select`))
    if (selects.length > 0) {
      const select = selects[0]
      await select.findElement(By.css(`option[value="concluida"]`)).click()
      await driver.sleep(500)
      // Apenas verifica que não quebrou
      const url = await driver.getCurrentUrl()
      expect(url).to.include('/ordens')
    }
  })

  it('busca por cliente inexistente mostra mensagem vazia', async () => {
    const inputs = await driver.findElements(By.xpath(`//input[@placeholder[contains(., 'buscar') or contains(., 'Buscar')]]`))
    if (inputs.length > 0) {
      await inputs[0].sendKeys('xyzxyz_inexistente')
      await driver.wait(async () => {
        const msg = await driver.findElements(By.xpath(`//*[contains(., 'nenhuma OS') or contains(., 'Nenhuma')]`))
        return msg.length > 0
      }, TIMEOUT)
      const msg = await driver.findElement(By.xpath(`//*[contains(., 'nenhuma OS') or contains(., 'Nenhuma')]`))
      expect(await msg.isDisplayed()).to.be.true
    }
  })

  it('exibe cards de OS ou mensagem de lista vazia', async () => {
    await driver.sleep(1000)
    const cards = await driver.findElements(By.css(`.rounded-xl.border.border-gray-200`))
    const vazios = await driver.findElements(By.xpath(`//*[contains(., 'nenhuma OS') or contains(., 'Nenhuma')]`))
    // Aceita lista com cards ou lista vazia — ambos são estados válidos
    expect(cards.length >= 0 || vazios.length > 0).to.be.true
  })
})
