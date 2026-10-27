# Ativos visuais do Help Desk

Esta pasta concentra os elementos visuais usados pelo README principal.

## Identidade e diagramas

| Arquivo | Conteúdo |
| --- | --- |
| `help-desk-banner.svg` | Banner dark em azul-escuro e ciano. |
| `architecture.svg` | Fluxo React → segurança JWT → Spring Boot → bancos. |

## Capturas reais

| Arquivo | Tela |
| --- | --- |
| `01-login.png` | Autenticação. |
| `02-home.png` | Página inicial administrativa. |
| `03-dashboard.png` | Indicadores e gráficos. |
| `04-tickets.png` | Fila, filtros e estados dos chamados. |
| `05-ticket-details.png` | Detalhes, comentários e atribuição técnica. |
| `05-ticket-history.png` | Histórico auditável do chamado. |
| `06-users.png` | Gestão de contas e perfis demonstrativos. |

As capturas foram feitas em uma instância headless e isolada do Chrome, com resolução base de 1440 × 900. O frontend consumiu a API local real e o perfil H2; nenhuma sessão pessoal do navegador foi utilizada.

Para evitar exposição indevida, a tela de usuários foi filtrada para `helpdesk.local`. Tokens, senha digitada, console, headers e variáveis de ambiente não aparecem nas imagens.

## Reproduzir as capturas

Com backend local e frontend ativos, execute o script sem dependências externas:

```powershell
$env:HELP_DESK_CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:HELP_DESK_DEMO_EMAIL = 'admin@helpdesk.local'
$env:HELP_DESK_DEMO_PASSWORD = 'Admin@12345'

node docs/capture-screenshots.mjs
```

O script cria um perfil temporário do navegador, acessa somente `http://localhost:5174`, grava os PNGs nesta pasta e remove o perfil isolado ao terminar.
