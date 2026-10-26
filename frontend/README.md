# Help Desk Web

Frontend do Help Desk com React, TypeScript, Vite, Tailwind CSS, React Router e Axios.

## Executar

Use Node.js 24 ou superior. Instale as dependências locais e inicie o Vite:

```bash
npm ci
npm run dev
```

Uma instalação portátil pode ser usada em `.tools`, mas esse diretório é local e não é versionado.

A interface fica em `http://127.0.0.1:5174`. Durante o desenvolvimento, o Vite encaminha `/api` para `http://localhost:8081`.

Configurações opcionais podem ser definidas em `.env.local` a partir de `.env.example`:

- `VITE_API_URL`: caminho base consumido pelo Axios;
- `VITE_PROXY_TARGET`: endereço do backend usado pelo proxy;
- `VITE_DEV_PORT`: porta do servidor Vite.

## Validar

```bash
npm run typecheck
npm run build
```

Consulte o `README.md` da raiz para iniciar o backend local e obter as credenciais exclusivamente demonstrativas.
