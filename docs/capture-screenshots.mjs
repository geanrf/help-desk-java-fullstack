import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const chromePath = process.env.HELP_DESK_CHROME_PATH
const demoEmail = process.env.HELP_DESK_DEMO_EMAIL ?? 'admin@helpdesk.local'
const demoPassword = process.env.HELP_DESK_DEMO_PASSWORD ?? 'Admin@12345'
const baseUrl = process.env.HELP_DESK_FRONTEND_URL ?? 'http://localhost:5174'

if (!chromePath) {
  throw new Error('Defina HELP_DESK_CHROME_PATH com o caminho do executavel do Chrome.')
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputDirectory = path.join(scriptDirectory, 'images')
const profileDirectory = await mkdtemp(path.join(tmpdir(), 'help-desk-chrome-'))

await mkdir(outputDirectory, { recursive: true })

const browser = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-extensions',
    '--disable-gpu',
    '--disable-sync',
    '--hide-scrollbars',
    '--no-default-browser-check',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDirectory}`,
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
)

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitForDevToolsPort() {
  const portFile = path.join(profileDirectory, 'DevToolsActivePort')
  const deadline = Date.now() + 15_000

  while (Date.now() < deadline) {
    try {
      const [port] = (await readFile(portFile, 'utf8')).trim().split(/\r?\n/)
      if (port) return Number(port)
    } catch {
      // O Chrome ainda esta inicializando o perfil isolado.
    }
    await delay(100)
  }

  throw new Error('O Chrome nao disponibilizou a porta do DevTools a tempo.')
}

class CdpClient {
  constructor(url) {
    this.nextId = 1
    this.pending = new Map()
    this.socket = new WebSocket(url)

    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (!message.id) return

      const request = this.pending.get(message.id)
      if (!request) return

      this.pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
    })
  }

  async connect() {
    if (this.socket.readyState === WebSocket.OPEN) return

    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    const response = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })
    this.socket.send(JSON.stringify({ id, method, params }))
    return response
  }

  close() {
    this.socket.close()
  }
}

let client

async function evaluate(expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })

  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text ?? 'Falha ao avaliar JavaScript na pagina.')
  }

  return response.result.value
}

async function waitFor(expression, label, timeout = 15_000) {
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    if (await evaluate(`Boolean(${expression})`)) return
    await delay(150)
  }

  throw new Error(`Tempo esgotado aguardando: ${label}`)
}

async function navigate(route, readyExpression, label) {
  await client.send('Page.navigate', { url: `${baseUrl}${route}` })
  await waitFor("document.readyState === 'complete'", `carregamento de ${label}`)
  await waitFor(readyExpression, label)
  await delay(800)
  await evaluate('window.scrollTo(0, 0)')
}

async function capture(fileName, fullPage = true) {
  let clip

  if (fullPage) {
    const metrics = await client.send('Page.getLayoutMetrics')
    const height = Math.min(Math.max(Math.ceil(metrics.cssContentSize.height), 900), 2600)
    clip = { x: 0, y: 0, width: 1440, height, scale: 1 }
  }

  const screenshot = await client.send('Page.captureScreenshot', {
    captureBeyondViewport: fullPage,
    clip,
    format: 'png',
    fromSurface: true,
  })

  const outputPath = path.join(outputDirectory, fileName)
  await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'))
  console.log(`${fileName} salvo`)
}

try {
  const port = await waitForDevToolsPort()
  const targetResponse = await fetch(`${`http://127.0.0.1:${port}`}/json/new?${encodeURIComponent(`${baseUrl}/login`)}`, {
    method: 'PUT',
  })

  if (!targetResponse.ok) {
    throw new Error(`Falha ao criar a aba isolada: HTTP ${targetResponse.status}`)
  }

  const target = await targetResponse.json()
  client = new CdpClient(target.webSocketDebuggerUrl)
  await client.connect()
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })

  await waitFor("document.querySelector('form input[name=email]') && document.querySelector('form input[name=password]')", 'formulario de login')
  await delay(500)
  await capture('01-login.png', false)

  await evaluate(`(() => {
    const setInputValue = (input, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
    setInputValue(document.querySelector('input[name=email]'), ${JSON.stringify(demoEmail)})
    setInputValue(document.querySelector('input[name=password]'), ${JSON.stringify(demoPassword)})
    document.querySelector('form').requestSubmit()
  })()`)

  await waitFor("location.pathname === '/app' && document.querySelector('main')", 'pagina inicial autenticada')
  await delay(800)
  await capture('02-home.png', false)

  await navigate(
    '/app/dashboard',
    "document.body.innerText.includes('Dashboard de atendimento') && document.querySelectorAll('svg').length >= 2",
    'dashboard',
  )
  await capture('03-dashboard.png')

  await navigate(
    '/app/tickets',
    "document.querySelector('a[href^=\"/app/tickets/\"]:not([href=\"/app/tickets/new\"])')",
    'lista de chamados',
  )
  await capture('04-tickets.png')

  const ticketPath = await evaluate(`(() => {
    const link = [...document.querySelectorAll('a[href^="/app/tickets/"]')]
      .find((item) => item.getAttribute('href') !== '/app/tickets/new')
    return link?.getAttribute('href') ?? null
  })()`)

  if (!ticketPath) throw new Error('Nenhum chamado demonstrativo foi encontrado para a captura de detalhes.')

  await navigate(
    ticketPath,
    "document.body.innerText.includes('Voltar aos chamados') && document.querySelector('aside')",
    'detalhes do chamado',
  )
  await capture('05-ticket-details.png')

  await evaluate(`(() => {
    const normalize = (value) => value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
    const historyButton = [...document.querySelectorAll('button')]
      .find((button) => normalize(button.textContent ?? '').includes('Historico'))
    if (!historyButton) throw new Error('A aba de historico nao foi encontrada.')
    historyButton.click()
  })()`)
  await waitFor("document.querySelector('ol li')", 'historico do chamado')
  await delay(500)
  await capture('05-ticket-history.png')

  await navigate(
    '/app/users?search=helpdesk.local',
    "document.body.innerText.includes('Contas cadastradas') && document.querySelector('table tbody tr')",
    'gestao de usuarios',
  )
  await capture('06-users.png')
} finally {
  client?.close()
  browser.kill()

  const safePrefix = path.join(tmpdir(), 'help-desk-chrome-').toLowerCase()
  if (!profileDirectory.toLowerCase().startsWith(safePrefix)) {
    throw new Error('O diretorio temporario do Chrome nao passou na verificacao de seguranca.')
  }

  await delay(500)
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
}
