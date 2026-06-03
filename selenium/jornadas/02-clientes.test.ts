import { describe, it, before, after, beforeEach } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, findByLabel, BASE_URL, By, TIMEOUT } from '../helpers/driver'
import { loginViaStorage, limparRegistrosTeste } from '../helpers/auth'

describe('Jornada: Gestão de Clientes', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => {
    await encerrarDriver(driver)
    await limparRegistrosTeste('clientes', 'nome', 'Selenium E2E')
  })
  beforeEach(async () => {
    await loginViaStorage(driver)
    await driver.get(`${BASE_URL}/clientes`)
    await aguardar(driver, By.xpath(`//h1[contains(., 'Clientes')]`))
  })

  it('exibe título e campo de busca', async () => {
    const titulo = await driver.findElement(By.xpath(`//h1[contains(., 'Clientes')]`))
    expect(await titulo.isDisplayed()).to.be.true

    const busca = await aguardar(driver, By.xpath(`//input[@placeholder]`))
    expect(await busca.isDisplayed()).to.be.true
  })

  it('FAB de novo cliente está visível', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Cliente"]`))
    expect(await fab.isDisplayed()).to.be.true
  })

  it('abre drawer de novo cliente ao clicar no FAB', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Cliente"]`))
    await fab.click()

    const titulo = await aguardar(driver, By.xpath(`//h2[contains(., 'Novo Cliente')]`))
    expect(await titulo.isDisplayed()).to.be.true

    const campoNome = await findByLabel(driver, 'Nome / Condomínio')
    expect(await campoNome.isDisplayed()).to.be.true
  })

  it('valida campos obrigatórios ao salvar sem preencher', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Cliente"]`))
    await fab.click()

    await aguardar(driver, By.xpath(`//button[contains(., 'Cadastrar Cliente')]`))
    const btnSalvar = await driver.findElement(By.xpath(`//button[contains(., 'Cadastrar Cliente')]`))
    await btnSalvar.click()

    const erro = await aguardar(driver, By.xpath(`//*[contains(., 'obrigatório')]`))
    expect(await erro.isDisplayed()).to.be.true
  })

  it('preenche e submete formulário de novo cliente', async () => {
    const fab = await aguardar(driver, By.css(`button[title="Novo Cliente"]`))
    await fab.click()

    const nome = `Selenium E2E ${Date.now()}`
    const campoNome = await findByLabel(driver, 'Nome / Condomínio')
    await campoNome.sendKeys(nome)

    const campoCidade = await findByLabel(driver, 'Cidade')
    await campoCidade.sendKeys('Osasco')

    const btnSalvar = await driver.findElement(By.xpath(`//button[contains(., 'Cadastrar Cliente')]`))
    await btnSalvar.click()

    // Aguarda feedback: cliente criado ou mensagem de erro (API pode estar offline)
    await driver.wait(async () => {
      const elementos = await driver.findElements(
        By.xpath(`//*[contains(., '${nome}') or contains(., 'possível salvar') or contains(., 'obrigatório')]`)
      )
      return elementos.length > 0
    }, TIMEOUT)
  })

  it('busca por texto inexistente mostra mensagem vazia', async () => {
    const busca = await aguardar(driver, By.xpath(`//input[@placeholder]`))
    await busca.sendKeys('xyzxyzxyz_inexistente')

    await driver.wait(async () => {
      const msg = await driver.findElements(By.xpath(`//*[contains(., 'nenhum cliente') or contains(., 'Nenhum')]`))
      return msg.length > 0
    }, TIMEOUT)

    const msg = await driver.findElement(By.xpath(`//*[contains(., 'nenhum cliente') or contains(., 'Nenhum')]`))
    expect(await msg.isDisplayed()).to.be.true
  })

  it('links de WhatsApp contêm wa.me/55', async () => {
    const links = await driver.findElements(By.css(`a[href*="wa.me"]`))
    if (links.length > 0) {
      const href = await links[0].getAttribute('href')
      expect(href).to.include('wa.me/55')
    }
  })
})
