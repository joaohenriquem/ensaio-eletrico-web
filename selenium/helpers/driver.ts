import { Builder, WebDriver, By, until, WebElement, Key } from 'selenium-webdriver'
import { Options as ChromeOptions } from 'selenium-webdriver/chrome'

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
export const TIMEOUT = 10_000

export async function criarDriver(): Promise<WebDriver> {
  const opts = new ChromeOptions()
  if (process.env.HEADLESS !== 'false') {
    opts.addArguments('--headless=new')
  }
  opts.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,900',
    '--disable-gpu',
    '--disable-extensions',
    '--lang=pt-BR'
  )

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(opts)
    .build()
}

export async function encerrarDriver(driver: WebDriver): Promise<void> {
  await driver.quit()
}

/** Aguarda elemento aparecer e retorna ele */
export async function aguardar(driver: WebDriver, locator: ReturnType<typeof By.css>, ms = TIMEOUT): Promise<WebElement> {
  await driver.wait(until.elementLocated(locator), ms)
  const el = await driver.findElement(locator)
  await driver.wait(until.elementIsVisible(el), ms)
  return el
}

/** Encontra input/textarea associado a um label pelo texto */
export async function findByLabel(driver: WebDriver, labelText: string): Promise<WebElement> {
  const label = await aguardar(driver, By.xpath(`//label[contains(., '${labelText}')]`))
  const forAttr = await label.getAttribute('for')
  if (forAttr) {
    return driver.findElement(By.id(forAttr))
  }
  return driver.findElement(By.xpath(`//label[contains(., '${labelText}')]/following-sibling::*[self::input or self::textarea]`))
}

/** Clica num botão pelo texto visível */
export async function clicarBotao(driver: WebDriver, texto: string | RegExp): Promise<void> {
  const xpath = typeof texto === 'string'
    ? `//button[contains(., '${texto}')]`
    : `//button`
  const btn = await aguardar(driver, By.xpath(xpath))
  await btn.click()
}

export { By, until, Key }
