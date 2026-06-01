import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import { WebDriver } from 'selenium-webdriver'
import { criarDriver, encerrarDriver, aguardar, BASE_URL, By, TIMEOUT } from '../helpers/driver'

describe('Jornada: Autenticação', function () {
  let driver: WebDriver

  before(async () => { driver = await criarDriver() })
  after(async () => { await encerrarDriver(driver) })

  it('redireciona para /login ao acessar / sem autenticação', async () => {
    await driver.get(`${BASE_URL}/`)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl()
      return url.includes('/login')
    }, TIMEOUT)
    const url = await driver.getCurrentUrl()
    expect(url).to.include('/login')
  })

  it('redireciona para /login ao acessar /clientes sem autenticação', async () => {
    await driver.get(`${BASE_URL}/clientes`)
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl()
      return url.includes('/login')
    }, TIMEOUT)
    const url = await driver.getCurrentUrl()
    expect(url).to.include('/login')
  })

  it('exibe campos de usuário, senha e botão Continuar', async () => {
    await driver.get(`${BASE_URL}/login`)
    const usuario = await aguardar(driver, By.id('username'))
    const senha = await aguardar(driver, By.id('password'))
    const botao = await aguardar(driver, By.xpath(`//button[contains(., 'Continuar')]`))
    expect(await usuario.isDisplayed()).to.be.true
    expect(await senha.isDisplayed()).to.be.true
    expect(await botao.isDisplayed()).to.be.true
  })

  it('exibe checkbox de manter conectado', async () => {
    await driver.get(`${BASE_URL}/login`)
    const checkbox = await aguardar(driver, By.xpath(`//input[@type='checkbox']`))
    expect(await checkbox.isDisplayed()).to.be.true
    const label = await driver.findElement(By.xpath(`//input[@type='checkbox']/following-sibling::span`))
    const texto = await label.getText()
    expect(texto).to.include('7 dias')
  })

  it('exibe link de esqueci minha senha', async () => {
    await driver.get(`${BASE_URL}/login`)
    const link = await aguardar(driver, By.xpath(`//a[contains(., 'Esqueci')]`))
    expect(await link.isDisplayed()).to.be.true
  })

  it('exibe erro ao submeter credenciais inválidas', async () => {
    await driver.get(`${BASE_URL}/login`)
    const usuario = await aguardar(driver, By.id('username'))
    const senha = await driver.findElement(By.id('password'))
    const botao = await driver.findElement(By.xpath(`//button[contains(., 'Continuar')]`))

    await usuario.sendKeys('usuario_invalido_teste')
    await senha.sendKeys('senha_errada_teste')
    await botao.click()

    await driver.wait(async () => {
      const erros = await driver.findElements(By.xpath(`//*[contains(., 'inválido') or contains(., 'Usuário ou senha')]`))
      return erros.length > 0
    }, TIMEOUT)

    const erro = await driver.findElement(By.xpath(`//*[contains(., 'inválido') or contains(., 'Usuário ou senha')]`))
    expect(await erro.isDisplayed()).to.be.true
  })

  it('exibe link para solicitar cadastro', async () => {
    await driver.get(`${BASE_URL}/login`)
    const link = await aguardar(driver, By.xpath(`//a[contains(., 'Solicitar cadastro')]`))
    expect(await link.isDisplayed()).to.be.true
  })
})
